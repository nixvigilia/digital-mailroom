"use server";

import {cache} from "react";
import {redirect} from "next/navigation";
import {createClient} from "@/utils/supabase/server";
import {prisma} from "@/utils/prisma";
import {SubscriptionStatus} from "@/app/generated/prisma/enums";

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

export const getKYCData = cache(async (userId: string) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: {id: userId},
      select: {
        kyc_verification: true,
      },
    });

    if (!profile?.kyc_verification) {
      return null;
    }

    const kyc = profile.kyc_verification;
    const supabase = await createClient();

    // Generate signed URLs for images
    let idFileFrontUrl = null;
    let idFileBackUrl = null;

    if (kyc.id_file_front_url) {
      const {data} = await supabase.storage
        .from("keep")
        .createSignedUrl(kyc.id_file_front_url, 3600); // 1 hour expiry
      idFileFrontUrl = data?.signedUrl || null;
    }

    if (kyc.id_file_back_url) {
      const {data} = await supabase.storage
        .from("keep")
        .createSignedUrl(kyc.id_file_back_url, 3600);
      idFileBackUrl = data?.signedUrl || null;
    }

    return {
      ...kyc,
      id_file_front_signed_url: idFileFrontUrl, // New field for signed URL
      id_file_back_signed_url: idFileBackUrl,
    };
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    return null;
  }
});

export const getCurrentUserKYCStatus = cache(async (): Promise<string> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return "NOT_STARTED";
  }
  return await getKYCStatus(currentUser.userId);
});

/**
 * Get the user's plan type
 * Returns the plan_type string (e.g., "FREE", "BASIC", "PREMIUM")
 * Returns "FREE" if no active subscription exists
 */
export const getUserPlanType = cache(
  async (userId: string): Promise<string> => {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          profile_id: userId,
          status: SubscriptionStatus.ACTIVE,
        },
        select: {
          plan_type: true,
        },
        orderBy: {
          started_at: "desc",
        },
      });

      return subscription?.plan_type || "FREE";
    } catch (error) {
      console.error("Error fetching user plan type:", error);
      // If it's a connection error, return FREE and log it
      if (error instanceof Error) {
        console.error("Database connection error:", error.message);
      }
      return "FREE"; // Default to FREE on error
    }
  }
);

/**
 * Get the current user's plan type
 */
export const getCurrentUserPlanType = cache(async (): Promise<string> => {
  const session = await verifySession();
  return await getUserPlanType(session.userId);
});

export const getUserMailboxDetails = cache(async (userId: string) => {
  try {
    // Find the active subscription that has a mailbox assigned
    const subscription = await prisma.subscription.findFirst({
      where: {
        profile_id: userId,
        status: SubscriptionStatus.ACTIVE,
        mailbox_id: {not: null},
      },
      include: {
        mailbox: {
          include: {
            cluster: {
              include: {
                mailing_location: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!subscription?.mailbox) {
      return null;
    }

    // Convert Decimal fields to numbers for client component compatibility
    const mailbox = subscription.mailbox;
    return {
      ...mailbox,
      width: Number(mailbox.width),
      height: Number(mailbox.height),
      depth: Number(mailbox.depth),
    };
  } catch (error) {
    console.error("Error fetching user mailbox:", error);
    return null;
  }
});

/**
 * Get all active subscriptions with assigned mailboxes for a user
 * Returns an array of subscriptions with their mailbox and location details
 */
export const getUserAllMailboxes = cache(async (userId: string) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        profile_id: userId,
        status: SubscriptionStatus.ACTIVE,
        mailbox_id: {not: null},
      },
      include: {
        mailbox: {
          include: {
            cluster: {
              include: {
                mailing_location: true,
              },
            },
          },
        },
        package: {
          select: {
            name: true,
            plan_type: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Convert Decimal fields to numbers and format the data
    return subscriptions
      .filter((sub) => sub.mailbox !== null)
      .map((sub) => ({
        subscriptionId: sub.id,
        planType: sub.plan_type,
        planName: sub.package?.name || sub.plan_type,
        billingCycle: sub.billing_cycle,
        mailbox: {
          ...sub.mailbox!,
          width: Number(sub.mailbox!.width),
          height: Number(sub.mailbox!.height),
          depth: Number(sub.mailbox!.depth),
        },
        location: sub.mailbox!.cluster.mailing_location,
        cluster: {
          id: sub.mailbox!.cluster.id,
          name: sub.mailbox!.cluster.name,
          description: sub.mailbox!.cluster.description,
        },
      }));
  } catch (error) {
    console.error("Error fetching user mailboxes:", error);
    return [];
  }
});
