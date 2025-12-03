"use server";

import {getCurrentUser} from "@/utils/supabase/dal";
import {prisma} from "@/utils/prisma";
import {SubscriptionStatus} from "@/app/generated/prisma/enums";

/**
 * Generate a unique referral code
 * Uses user ID as base and ensures uniqueness
 */
async function generateUniqueReferralCode(
  userId: string,
  prisma: any
): Promise<string> {
  // Base code from user ID (first 8 chars, uppercase, no dashes)
  let baseCode = userId.substring(0, 8).toUpperCase().replace(/-/g, "");
  let referralCode = baseCode;
  let attempts = 0;
  const maxAttempts = 10;

  // Check for uniqueness and append suffix if needed
  while (attempts < maxAttempts) {
    const existing = await prisma.profile.findUnique({
      where: {referral_code: referralCode},
      select: {id: true},
    });

    if (!existing) {
      return referralCode; // Unique code found
    }

    // If conflict, append a random suffix
    const suffix = Math.random().toString(36).substring(2, 4).toUpperCase();
    referralCode = baseCode.substring(0, 6) + suffix;
    attempts++;
  }

  // Fallback: use full UUID hash if still conflicts
  const hash = userId.replace(/-/g, "").substring(0, 8).toUpperCase();
  return hash;
}

/**
 * Generate and assign a unique referral code to the current user
 */
export async function generateReferralCode() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: "You must be logged in to generate a referral code",
      };
    }

    const userId = currentUser.userId;
    const {prisma} = await import("@/utils/prisma");

    // Check if user already has a referral code
    const profile = await prisma.profile.findUnique({
      where: {id: userId},
      select: {
        referral_code: true,
      },
    });

    if (profile?.referral_code) {
      return {
        success: true,
        message: "You already have a referral code",
        referralCode: profile.referral_code,
      };
    }

    // Generate unique referral code
    const uniqueReferralCode = await generateUniqueReferralCode(userId, prisma);

    // Update profile with referral code
    await prisma.profile.update({
      where: {id: userId},
      data: {
        referral_code: uniqueReferralCode,
      },
    });

    // Create referral record if user was referred (referrer must have a code)
    await createReferralRecord(userId);

    return {
      success: true,
      message: "Referral code generated successfully!",
      referralCode: uniqueReferralCode,
    };
  } catch (error) {
    console.error("Error generating referral code:", error);
    return {
      success: false,
      message: "Failed to generate referral code. Please try again.",
    };
  }
}

/**
 * Create referral record after user confirms email
 * Called from email confirmation route or when user generates their code
 */
export async function createReferralRecord(userId: string) {
  try {
    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: {id: userId},
      select: {
        referred_by: true,
      },
    });

    if (!profile || !profile.referred_by) {
      return; // No referral to process
    }

    // Get referrer's profile to get their referral code
    const referrer = await prisma.profile.findUnique({
      where: {id: profile.referred_by},
      select: {
        id: true,
        referral_code: true,
      },
    });

    if (!referrer || !referrer.referral_code) {
      return; // Referrer not found or no referral code (they haven't generated one yet)
    }

    // Check if referral record already exists
    const existingReferral = await prisma.referral.findUnique({
      where: {referred_id: userId},
    });

    if (existingReferral) {
      return; // Already created
    }

    // Create referral record
    await prisma.referral.create({
      data: {
        referrer_id: referrer.id,
        referred_id: userId,
        referral_code: referrer.referral_code,
        status: "pending",
        earnings: 0,
      },
    });
  } catch (error) {
    console.error("Error creating referral record:", error);
    // Don't throw - referral creation shouldn't block user confirmation
  }
}
