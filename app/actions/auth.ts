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

  const {error} = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
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
