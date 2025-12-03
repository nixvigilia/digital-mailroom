"use server";

import {prisma} from "@/utils/prisma";
import {verifySession} from "@/utils/supabase/dal";
import {revalidatePath} from "next/cache";
import {UserRole} from "@/app/generated/prisma/enums";
import {logActivity} from "./activity-log";

// Helper to ensure the user is an admin
async function ensureAdmin() {
  const session = await verifySession();
  const profile = await prisma.profile.findUnique({
    where: {id: session.userId},
    select: {role: true},
  });

  if (profile?.role !== UserRole.SYSTEM_ADMIN) {
    throw new Error("Unauthorized: Access restricted to administrators.");
  }
  return session;
}

export async function getAdminProfile() {
  try {
    const session = await ensureAdmin();
    const profile = await prisma.profile.findUnique({
      where: {id: session.userId},
      select: {
        password_hint: true,
        integration_email: true,
      },
    });

    return {
      success: true,
      data: {
        passwordHint: profile?.password_hint,
        integrationEmail: profile?.integration_email,
      },
    };
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return {success: false, message: "Failed to fetch profile"};
  }
}

export async function updateAdminProfile(
  passwordHint: string,
  integrationEmail: string
) {
  try {
    const session = await ensureAdmin();

    await prisma.profile.update({
      where: {id: session.userId},
      data: {
        password_hint: passwordHint,
        integration_email: integrationEmail,
      },
    });

    // Log Activity
    await logActivity(session.userId, "UPDATE_PROFILE", {
      updated_fields: ["password_hint", "integration_email"],
    });

    revalidatePath("/admin/settings");
    return {success: true, message: "Profile updated successfully"};
  } catch (error) {
    console.error("Error updating admin profile:", error);
    return {success: false, message: "Failed to update profile"};
  }
}
