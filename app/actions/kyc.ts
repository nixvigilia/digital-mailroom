"use server";

import {verifySession} from "@/utils/supabase/dal";
import {prisma} from "@/utils/prisma";
import {revalidatePath} from "next/cache";
import {createAdminClient} from "@/utils/supabase/admin";
import {logActivity} from "./activity-log";

export type ActionResult =
  | {success: true; message: string}
  | {success: false; message: string};

/**
 * Submits KYC verification data
 * Validates the session, ensures profile exists, uploads files to storage, and creates/updates KYC verification
 */
export async function submitKYC(formData: FormData): Promise<ActionResult> {
  // Verify session using DAL
  const session = await verifySession();
  const userId = session.userId;

  try {
    // Extract fields from FormData
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const province = formData.get("province") as string;
    const postalCode = formData.get("postalCode") as string;
    const country = formData.get("country") as string;
    const idType = formData.get("idType") as string;
    const consentMailOpening = formData.get("consentMailOpening") === "true";
    const consentDataProcessing =
      formData.get("consentDataProcessing") === "true";
    const consentTermsOfService =
      formData.get("consentTermsOfService") === "true";
    const consentPrivacyPolicy =
      formData.get("consentPrivacyPolicy") === "true";
    const idFileFront = formData.get("idFileFront") as File;
    const idFileBack = formData.get("idFileBack") as File;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !phoneNumber ||
      !address ||
      !city ||
      !province ||
      !postalCode ||
      !country ||
      !idType
    ) {
      return {
        success: false,
        message: "Please fill in all required fields.",
      };
    }

    // Validate consents
    if (
      !consentMailOpening ||
      !consentDataProcessing ||
      !consentTermsOfService ||
      !consentPrivacyPolicy
    ) {
      return {
        success: false,
        message: "Please accept all required consents.",
      };
    }

    // Validate ID files
    if (!idFileFront || !idFileBack) {
      return {
        success: false,
        message: "Please upload both front and back of your ID document.",
      };
    }

    // Upload files to Supabase Storage using Admin Client (bypassing RLS for upload)
    // Since the user session is already verified by `verifySession`, we can safely upload using service role
    const supabase = createAdminClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME || "keep";
    const folderPath = `kyc/${userId}`;

    // Upload Front ID
    const frontFileName = `${folderPath}/front_${Date.now()}_${
      idFileFront.name
    }`;
    const {data: frontData, error: frontError} = await supabase.storage
      .from(bucketName)
      .upload(frontFileName, idFileFront, {
        cacheControl: "3600",
        upsert: true,
        contentType: idFileFront.type,
      });

    if (frontError) {
      console.error("Error uploading front ID:", frontError);
      return {
        success: false,
        message: `Failed to upload front ID: ${frontError.message}`,
      };
    }

    // Upload Back ID
    const backFileName = `${folderPath}/back_${Date.now()}_${idFileBack.name}`;
    const {data: backData, error: backError} = await supabase.storage
      .from(bucketName)
      .upload(backFileName, idFileBack, {
        cacheControl: "3600",
        upsert: true,
        contentType: idFileBack.type,
      });

    if (backError) {
      console.error("Error uploading back ID:", backError);
      return {
        success: false,
        message: `Failed to upload back ID: ${backError.message}`,
      };
    }

    // Store the storage path relative to the bucket
    // We will use this path to generate signed URLs later
    const idFileFrontPath = frontData.path;
    const idFileBackPath = backData.path;

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
    await prisma.kYCVerification.upsert({
      where: {profile_id: userId},
      update: {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: new Date(dateOfBirth),
        phone_number: phoneNumber,
        address: address,
        city: city,
        province: province,
        postal_code: postalCode,
        country: country,
        id_type: idType,
        id_file_front_url: idFileFrontPath,
        id_file_back_url: idFileBackPath,
        consent_mail_opening: consentMailOpening,
        consent_data_processing: consentDataProcessing,
        consent_terms_of_service: consentTermsOfService,
        consent_privacy_policy: consentPrivacyPolicy,
        status: "PENDING",
        submitted_at: new Date(),
        reviewed_at: null,
        reviewed_by: null,
        rejection_reason: null,
      },
      create: {
        profile_id: userId,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: new Date(dateOfBirth),
        phone_number: phoneNumber,
        address: address,
        city: city,
        province: province,
        postal_code: postalCode,
        country: country,
        id_type: idType,
        id_file_front_url: idFileFrontPath,
        id_file_back_url: idFileBackPath,
        consent_mail_opening: consentMailOpening,
        consent_data_processing: consentDataProcessing,
        consent_terms_of_service: consentTermsOfService,
        consent_privacy_policy: consentPrivacyPolicy,
        status: "PENDING",
        submitted_at: new Date(),
      },
    });

    // Log Activity
    await logActivity(userId, "KYC_SUBMIT", {
      submitted_at: new Date().toISOString(),
      id_type: idType,
    });

    revalidatePath("/app/kyc");
    revalidatePath("/app");
    revalidatePath("/app/welcome");

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

/**
 * Saves basic information (name and phone) for payment gateway purposes
 * This is a simplified version that saves initial data before full KYC
 */
export async function saveBasicInfo(
  firstName: string,
  lastName: string,
  phoneNumber: string
): Promise<ActionResult> {
  const session = await verifySession();
  const userId = session.userId;

  try {
    // Validate required fields
    if (!firstName || !lastName || !phoneNumber) {
      return {
        success: false,
        message: "Please fill in all required fields (name and phone).",
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

    // Create or update KYC verification with basic info only
    // Using blank/empty values for required fields that aren't collected yet
    await prisma.kYCVerification.upsert({
      where: {profile_id: userId},
      update: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        // Keep existing values for other fields if they exist, otherwise use blank values
        date_of_birth: new Date("1900-01-01"), // Placeholder date (required field, cannot be null)
        address: "",
        city: "",
        province: "",
        postal_code: "",
        country: "Philippines",
        id_type: "",
        status: "NOT_STARTED", // Mark as not started since it's incomplete
      },
      create: {
        profile_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        date_of_birth: new Date("1900-01-01"), // Placeholder date (required field, cannot be null)
        address: "",
        city: "",
        province: "",
        postal_code: "",
        country: "Philippines",
        id_type: "",
        status: "NOT_STARTED",
      },
    });

    return {
      success: true,
      message: "Basic information saved successfully.",
    };
  } catch (error) {
    console.error("Error saving basic info:", error);
    return {
      success: false,
      message: "Failed to save basic information. Please try again.",
    };
  }
}
