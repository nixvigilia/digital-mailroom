import "server-only";
import {getCurrentUser} from "@/utils/supabase/dal";
import {prisma} from "@/utils/prisma";
import {notFound} from "next/navigation";
import {SubscriptionStatus} from "@/app/generated/prisma/enums";

/**
 * Get referral data for current user
 * Pure data fetch - render-time only
 */
export async function getReferralData() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return null;
  }

  const userId = currentUser.userId;

  // Get user's profile with referral code
  const profile = await prisma.profile.findUnique({
    where: {id: userId},
    select: {
      referral_code: true,
    },
  });

  // Return null referral code if user hasn't generated one yet
  if (!profile || !profile.referral_code) {
    return {
      referralCode: null,
      referralLink: null,
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      transactions: [],
    };
  }

  const referralCode = profile.referral_code;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const referralLink = `${baseUrl}/signup?ref=${referralCode}`;

  // Get all referrals for this user (for counts)
  // Explicitly select only existing fields to avoid errors if the Prisma Client is stale (expecting deleted columns)
  const referrals = await prisma.referral.findMany({
    where: {referrer_id: userId},
    select: {
      id: true,
      referred: {
        select: {
          subscriptions: {
            where: {
              status: SubscriptionStatus.ACTIVE,
            },
            select: {
              plan_type: true,
            },
            take: 1,
          },
        },
      },
    },
  });

  // Get all transactions (for earnings and history)
  const transactions = await prisma.referralTransaction.findMany({
    where: {
      referral: {
        referrer_id: userId,
      },
    },
    include: {
      referral: {
        select: {
          referred: {
            select: {
              email: true,
            },
          },
          subscription_plan: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  // Calculate Stats
  const totalReferrals = referrals.length;

  // Active referrals are those with an active subscription (or marked active)
  const activeReferrals = referrals.filter(
    (r) => r.referred.subscriptions.length > 0
  ).length;

  const totalEarnings = transactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const pendingEarnings = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Transform transactions for UI
  const transformedTransactions = transactions.map((t) => ({
    id: t.id,
    email: t.referral.referred.email,
    amount: Number(t.amount),
    status: t.status,
    date: t.created_at,
    plan: t.description || t.referral.subscription_plan || "Subscription",
  }));

  return {
    referralCode,
    referralLink,
    totalReferrals,
    activeReferrals,
    totalEarnings,
    pendingEarnings,
    transactions: transformedTransactions,
  };
}
