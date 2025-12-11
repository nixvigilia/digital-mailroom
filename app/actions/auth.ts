"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/utils/supabase/server";
import {z} from "zod";
import {logActivity} from "./activity-log";

export type ActionResult =
  | {success: true; message: string}
  | {success: false; message: string; errors?: Record<string, string[]>};

// Validation schemas
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  referralCode: z.string().optional().nullable(),
});

export async function login(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  // Extract and validate form data
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate with Zod
  const validation = loginSchema.safeParse(rawData);

  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(issue.message);
    });

    return {
      success: false,
      message: "Validation failed. Please check your input.",
      errors,
    };
  }

  const {data, error} = await supabase.auth.signInWithPassword(validation.data);

  if (error) {
    return {success: false, message: error.message};
  }

  if (data.user) {
    try {
      const {prisma} = await import("@/utils/prisma");
      const {UserRole} = await import("@/app/generated/prisma/enums");

      const profile = await prisma.profile.findUnique({
        where: {id: data.user.id},
        select: {role: true},
      });

      // Prevent SYSTEM_ADMIN from logging in via public login
      if (profile?.role === UserRole.SYSTEM_ADMIN) {
        await supabase.auth.signOut();
        return {
          success: false,
          message: "Administrators must use the Admin Portal to login.",
        };
      }

      // Log successful login
      await logActivity(data.user.id, "LOGIN", {
        method: "password",
        portal: "user",
      });
    } catch (err) {
      console.error("Error checking user role during login:", err);
      // We don't block login on error, but logging it is important
    }
  }

  revalidatePath("/", "layout");
  return {success: true, message: "Successfully signed in!"};
}

export async function signup(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  // Extract and validate form data
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    referralCode: formData.get("referralCode") as string | null,
  };

  // Validate with Zod
  const validation = signupSchema.safeParse(rawData);

  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(issue.message);
    });

    return {
      success: false,
      message: "Validation failed. Please check your input.",
      errors,
    };
  }

  // Check if user already exists
  try {
    const {prisma} = await import("@/utils/prisma");

    // Check if profile already exists in database
    const existingProfile = await prisma.profile.findUnique({
      where: {email: validation.data.email},
      select: {id: true, email: true},
    });

    if (existingProfile) {
      return {
        success: false,
        message:
          "An account with this email already exists. Please try logging in instead.",
        errors: {
          email: [
            "This email is already registered. Please use the login page.",
          ],
        },
      };
    }

    // Also check Supabase Auth to catch any edge cases
    // Note: Supabase admin API would be needed for this, but we can rely on signUp error handling
    // The signUp will fail if user exists, but we've already checked the database above
  } catch (dbError) {
    console.error("Error checking existing user:", dbError);
    // Continue with signup attempt - Supabase will handle duplicate email errors
  }

  // Find referrer if referral code is provided (optional - doesn't block signup)
  let referrerId: string | null = null;
  if (rawData.referralCode && rawData.referralCode.trim() !== "") {
    try {
      const {prisma} = await import("@/utils/prisma");
      const referralCodeUpper = rawData.referralCode.trim().toUpperCase();

      const referrer = await prisma.profile.findFirst({
        where: {
          referral_code: referralCodeUpper,
        },
        select: {
          id: true,
        },
      });

      if (referrer) {
        referrerId = referrer.id;
      }
      // Silently continue if referral code not found - it's optional
    } catch (dbError) {
      // Log error but don't block signup if referral lookup fails
      console.error("Error looking up referrer (non-blocking):", dbError);
      // Continue with signup without referral tracking
      referrerId = null;
    }
  }

  // Sign up user - store referred_by in metadata for profile creation
  // Note: Only store if referrerId is not null (valid UUID string)
  const metadata: Record<string, any> = {};
  if (referrerId) {
    metadata.referred_by = referrerId; // Store as UUID string
  }

  const {data, error} = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: metadata, // Only include referred_by if it exists
    },
  });

  if (error) {
    // Handle email sending errors gracefully - user account may still be created
    // Check if error is related to email sending but user was created
    const isEmailError =
      error.message.includes("email") &&
      (error.message.includes("send") ||
        error.message.includes("confirmation") ||
        error.message.includes("delivery"));

    // If it's just an email sending error but user exists, still return success
    if (isEmailError && data?.user) {
      console.warn(
        "User created but email confirmation may not have been sent:",
        error.message
      );
      return {
        success: true,
        message:
          "Account created! Please check your email to confirm your account. If you don't receive an email, please contact support.",
      };
    }

    // Provide user-friendly error messages
    let errorMessage = error.message;

    // Check for common Supabase errors and provide clearer messages
    if (
      error.message.includes("already registered") ||
      error.message.includes("User already registered") ||
      error.message.includes("email address is already")
    ) {
      errorMessage =
        "An account with this email already exists. Please try logging in instead.";
      return {
        success: false,
        message: errorMessage,
        errors: {
          email: [
            "This email is already registered. Please use the login page.",
          ],
        },
      };
    }

    return {success: false, message: errorMessage};
  }

  // Note: User isn't logged in yet until they confirm email usually, but if auto-confirm is on, they might be.
  // Assuming email confirmation is required, we can't log "LOGIN" yet.
  // We can log "SIGNUP" if we have a user ID, but often signUp returns a user even if unconfirmed.
  if (data.user) {
    try {
    } catch (e) {
      console.error("Failed to log signup:", e);
    }
  }

  return {
    success: true,
    message:
      "Account created! Please check your email to confirm your account.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (user) {
    await logActivity(user.id, "LOGOUT", {method: "user_signout"});
  }
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
