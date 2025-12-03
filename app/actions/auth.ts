"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/utils/supabase/server";
import {z} from "zod";

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

  const {error} = await supabase.auth.signInWithPassword(validation.data);

  if (error) {
    return {success: false, message: error.message};
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

  const {error} = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: metadata, // Only include referred_by if it exists
    },
  });

  if (error) {
    return {success: false, message: error.message};
  }

  return {
    success: true,
    message:
      "Account created! Please check your email to confirm your account.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
