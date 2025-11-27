"use server";

import {cache} from "react";
import {redirect} from "next/navigation";
import {createClient} from "@/utils/supabase/server";
import {prisma} from "@/utils/prisma";

export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return {isAuth: true, userId: user.id, user};
});

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {userId: user.id, user};
});

export const getUserProfile = cache(async (userId: string) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: {id: userId},
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        user_type: true,
        role: true,
        created_at: true,
        updated_at: true,
        // Exclude sensitive data - only return what's needed
      },
    });

    return profile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
});

export const getCurrentUserProfile = cache(async () => {
  const session = await verifySession();
  const profile = await getUserProfile(session.userId);

  return {
    ...session,
    profile,
  };
});

export const getKYCStatus = cache(async (userId: string): Promise<string> => {
  try {
    const profile = await prisma.profile.findUnique({
      where: {id: userId},
      select: {
        kyc_verification: {
          select: {
            status: true,
          },
        },
      },
    });

    return profile?.kyc_verification?.status || "NOT_STARTED";
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return "NOT_STARTED";
  }
});

export const getCurrentUserKYCStatus = cache(async (): Promise<string> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return "NOT_STARTED";
  }
  return await getKYCStatus(currentUser.userId);
});
