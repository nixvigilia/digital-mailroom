"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/utils/supabase/server";
import {z} from "zod";
import {prisma} from "@/utils/prisma";
import {UserRole} from "@/app/generated/prisma/enums";
import {logActivity} from "./activity-log";
import {isIpAllowed} from "@/utils/ip-check";

export type ActionResult =
  | {success: true; message: string; redirectTo?: string}
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

export async function adminLogin(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

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

  // Check IP Allowlist
  const ipAllowed = await isIpAllowed();
  if (!ipAllowed) {
    return {
      success: false,
      message: "Access denied. Your IP address is not authorized.",
    };
  }

  const {data, error} = await supabase.auth.signInWithPassword(validation.data);

  if (error) {
    return {success: false, message: error.message};
  }

  if (!data.user) {
    return {success: false, message: "Authentication failed."};
  }

  // Check user role
  try {
    const profile = await prisma.profile.findUnique({
      where: {id: data.user.id},
      select: {role: true},
    });

    if (
      !profile ||
      (profile.role !== UserRole.SYSTEM_ADMIN &&
        profile.role !== UserRole.OPERATOR)
    ) {
      await supabase.auth.signOut();
      return {
        success: false,
        message:
          "Unauthorized. Access restricted to administrators and operators.",
      };
    }

    // Log Admin/Operator Login
    await logActivity(data.user.id, "LOGIN", {
      method: "password",
      portal: "admin_portal",
      role: profile.role,
    });

    revalidatePath("/admin", "layout");
    revalidatePath("/operator", "layout");

    return {
      success: true,
      message: "Successfully signed in!",
      redirectTo: profile.role === UserRole.OPERATOR ? "/operator" : "/admin",
    };
  } catch (err) {
    await supabase.auth.signOut();
    console.error("Error checking role:", err);
    return {success: false, message: "An internal error occurred."};
  }
}

export async function adminSignOut() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (user) {
    await logActivity(user.id, "LOGOUT", {method: "admin_signout"});
  }
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}
