"use server";

import {verifySession} from "@/utils/supabase/dal";
import {prisma} from "@/utils/prisma";
import {revalidatePath} from "next/cache";

export type ActionResult =
  | {success: true; message: string}
  | {success: false; message: string};

/**
 * Submits KYC verification data
 * Validates the session, ensures profile exists, and creates/updates KYC verification
 */
export async function submitKYC(formData: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  idType: string;
  idFileFrontUrl: string | null;
  idFileBackUrl: string | null;
  consentMailOpening: boolean;
  consentDataProcessing: boolean;
  consentTermsOfService: boolean;
  consentPrivacyPolicy: boolean;
}): Promise<ActionResult> {
  // Verify session using DAL
  const session = await verifySession();
  const userId = session.userId;

  try {
    // Validate required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.dateOfBirth ||
      !formData.phoneNumber ||
      !formData.address ||
      !formData.city ||
      !formData.province ||
      !formData.postalCode ||
      !formData.country ||
      !formData.idType
    ) {
      return {
        success: false,
        message: "Please fill in all required fields.",
      };
    }

    // Validate consents
    if (
      !formData.consentMailOpening ||
      !formData.consentDataProcessing ||
      !formData.consentTermsOfService ||
      !formData.consentPrivacyPolicy
    ) {
      return {
        success: false,
        message: "Please accept all required consents.",
      };
    }

    // Validate ID files
    if (!formData.idFileFrontUrl || !formData.idFileBackUrl) {
      return {
        success: false,
        message: "Please upload both front and back of your ID document.",
      };
    }

    // Ensure profile exists
    await prisma.profile.upsert({
      where: {id: userId},
      update: {},
      create: {
        id: userId,
        email: session.user.email || "",
        user_type: "INDIVIDUAL",
        role: "USER",
      },
    });

    // Create or update KYC verification
    // Note: Prisma converts model names to camelCase (KYCVerification -> kYCVerification)
    await prisma.kYCVerification.upsert({
      where: {profile_id: userId},
      update: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: new Date(formData.dateOfBirth),
        phone_number: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postalCode,
        country: formData.country,
        id_type: formData.idType,
        id_file_front_url: formData.idFileFrontUrl,
        id_file_back_url: formData.idFileBackUrl,
        consent_mail_opening: formData.consentMailOpening,
        consent_data_processing: formData.consentDataProcessing,
        consent_terms_of_service: formData.consentTermsOfService,
        consent_privacy_policy: formData.consentPrivacyPolicy,
        status: "PENDING",
        submitted_at: new Date(),
        // Reset review fields when resubmitting
        reviewed_at: null,
        reviewed_by: null,
        rejection_reason: null,
      },
      create: {
        profile_id: userId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: new Date(formData.dateOfBirth),
        phone_number: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postalCode,
        country: formData.country,
        id_type: formData.idType,
        id_file_front_url: formData.idFileFrontUrl,
        id_file_back_url: formData.idFileBackUrl,
        consent_mail_opening: formData.consentMailOpening,
        consent_data_processing: formData.consentDataProcessing,
        consent_terms_of_service: formData.consentTermsOfService,
        consent_privacy_policy: formData.consentPrivacyPolicy,
        status: "PENDING",
        submitted_at: new Date(),
      },
    });

    revalidatePath("/user/kyc");
    revalidatePath("/user/inbox");
    revalidatePath("/user/welcome");

    return {
      success: true,
      message:
        "KYC verification submitted successfully! Your verification is under review.",
    };
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return {
      success: false,
      message: "Failed to submit KYC verification. Please try again.",
    };
  }
}
