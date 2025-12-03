"use server";

import {getUserProfile, getUserProfileWithKYC} from "@/utils/supabase/dal";
import type {UserType, UserRole, KYCStatus} from "@prisma/client";

/**
 * User Profile DTO - Safe data transfer object for user profiles
 * Only includes fields that are safe to expose to the client
 */
export type UserProfileDTO = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
};

/**
 * KYC Status DTO - Safe data transfer object for KYC information
 * Excludes sensitive personal information
 */
export type KYCStatusDTO = {
  status: KYCStatus;
  submitted_at: Date | null;
  reviewed_at: Date | null;
  rejection_reason: string | null;
};

/**
 * User Profile with KYC DTO
 */
export type UserProfileWithKYCDTO = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType;
  role: UserRole;
  kyc_verification: KYCStatusDTO | null;
};

/**
 * Gets user profile DTO
 * Returns only safe, necessary data
 */
export async function getUserProfileDTO(
  userId: string
): Promise<UserProfileDTO | null> {
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    user_type: profile.user_type,
    role: profile.role,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

/**
 * Permission check functions for data visibility
 * These can be used to determine what data a user can see
 */

export function canSeeFullProfile(
  viewer: UserProfileDTO,
  target: UserProfileDTO
): boolean {
  // Users can see their own full profile
  if (viewer.id === target.id) return true;

  // Operators and KYC approvers can see all profiles
  if (viewer.role === "OPERATOR" || viewer.role === "KYC_APPROVER") return true;

  // Business admins can see profiles in their business account
  // This would need additional logic based on business_account relationships
  if (viewer.role === "BUSINESS_ADMIN") {
    // TODO:Add business account membership check
    return false;
  }

  return false;
}

export function canSeeKYCStatus(
  viewer: UserProfileDTO,
  target: UserProfileDTO
): boolean {
  // Users can see their own KYC status
  if (viewer.id === target.id) return true;

  // Operators and KYC approvers can see KYC status
  if (viewer.role === "OPERATOR" || viewer.role === "KYC_APPROVER") return true;

  return false;
}

export function canSeeRejectionReason(
  viewer: UserProfileDTO,
  target: UserProfileDTO
): boolean {
  // Users can see their own rejection reason
  if (viewer.id === target.id) return true;

  // Only operators and KYC approvers can see rejection reasons of other users
  if (viewer.role === "OPERATOR" || viewer.role === "KYC_APPROVER") return true;

  return false;
}
