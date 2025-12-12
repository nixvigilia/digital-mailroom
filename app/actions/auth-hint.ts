"use server";

import {prisma} from "@/utils/prisma";
import {verifySession} from "@/utils/supabase/dal";

export async function getPasswordHint(
  email: string
): Promise<{success: boolean; hint?: string; message?: string}> {
  try {
    const user = await prisma.profile.findUnique({
      where: {email},
      select: {password_hint: true},
    });

    if (user && user.password_hint) {
      return {success: true, hint: user.password_hint};
    } else {
      return {success: false, message: "No hint available for this email."};
    }
  } catch (error) {
    console.error("Error fetching password hint:", error);
    return {success: false, message: "Failed to retrieve hint."};
  }
}







