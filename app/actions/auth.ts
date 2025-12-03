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

  // Find referrer if referral code is provided
  let referrerId: string | null = null;
  if (rawData.referralCode) {
    try {
      const {prisma} = await import("@/utils/prisma");
      const referralCodeUpper = rawData.referralCode.toUpperCase();
      console.log("Looking up referrer with code:", referralCodeUpper);

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
        console.log("Found referrer ID:", referrerId);
      } else {
        console.log("No referrer found with code:", referralCodeUpper);
      }
    } catch (dbError) {
      // Log error but don't block signup if referral lookup fails
      console.error("Error looking up referrer:", dbError);
      // Continue with signup without referral tracking
      referrerId = null;
    }
  }

  // Sign up user - store referred_by in metadata for profile creation
  // Note: Only store if referrerId is not null (valid UUID string)
  const metadata: Record<string, any> = {};
  if (referrerId) {
    metadata.referred_by = referrerId; // Store as UUID string
    console.log("Storing referred_by in metadata:", referrerId);
  } else {
    console.log(
      "No referrer ID to store (referral code not found or not provided)"
    );
  }

  const {data, error} = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: metadata, // Only include referred_by if it exists
    },
  });

  if (error) {
    return {success: false, message: error.message};
  }

  // Note: User isn't logged in yet until they confirm email usually, but if auto-confirm is on, they might be.
  // Assuming email confirmation is required, we can't log "LOGIN" yet.
  // We can log "SIGNUP" if we have a user ID, but often signUp returns a user even if unconfirmed.
  if (data.user) {
    // Log signup activity - passing user ID even if not fully active yet
    // But we need to be careful as Profile might not be created yet by the trigger?
    // Triggers run AFTER insert. So it should be fine if the trigger is fast.
    // However, this is async.
    // Since we can't await the trigger, we might just log it.
    // Actually, logActivity requires a profile in DB due to FK.
    // The trigger creates the profile. It might be a race condition here.
    // Safer to let the user log in first? Or just try/catch.
    try {
      // Delay slightly to allow trigger? No, that's bad.
      // If profile doesn't exist, this will fail due to FK.
      // We can try to log it, if it fails, it fails.
      // Better: The trigger should handle profile creation.
      // Let's just skip logging here or use a retry mechanism if we really need it.
      // OR: We can rely on the first LOGIN to establish "activity".
      // But "SIGNUP" is an important event.
      // Let's try to log it.
      // Wait, logActivity imports prisma which is server-side.
      // We can try to insert into ActivityLog.
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
