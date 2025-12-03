"use server";

import {prisma} from "@/utils/prisma";
import {createAdminClient} from "@/utils/supabase/admin";
import {revalidatePath} from "next/cache";
import {verifyOperatorAccess} from "@/lib/packages";
import {logActivity} from "./activity-log";

export type KYCRequest = {
  id: string;
  profileId: string;
  firstName: string;
  lastName: string;
  status: string;
  submittedAt: Date | null;
  userType: string;
  email: string;
  businessName?: string;
};

export type KYCDetails = {
  id: string;
  profileId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  idType: string;
  idFileFrontUrl: string | null;
  idFileBackUrl: string | null;
  status: string;
  submittedAt: Date | null;
  userType: string;
  email: string;
  idFileFrontSignedUrl: string | null;
  idFileBackSignedUrl: string | null;
  businessName?: string;
};

export async function getPendingKYCRequests(): Promise<{
  success: boolean;
  data?: KYCRequest[];
  message?: string;
}> {
  try {
    const access = await verifyOperatorAccess();
    if (!access.success) {
      return {success: false, message: access.message};
    }

    const pendingKYC = await prisma.kYCVerification.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        profile: {
          select: {
            email: true,
            user_type: true,
            business_account: {
              select: {
                business_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        submitted_at: "asc",
      },
    });

    const formattedData: KYCRequest[] = pendingKYC.map((kyc) => ({
      id: kyc.id,
      profileId: kyc.profile_id,
      firstName: kyc.first_name,
      lastName: kyc.last_name,
      status: kyc.status,
      submittedAt: kyc.submitted_at,
      userType: kyc.profile.user_type,
      email: kyc.profile.email,
      businessName: kyc.profile.business_account?.business_name,
    }));

    return {success: true, data: formattedData};
  } catch (error) {
    console.error("Error fetching pending KYC requests:", error);
    return {success: false, message: "Failed to fetch pending requests"};
  }
}

export async function getKYCRequestDetails(
  id: string
): Promise<{success: boolean; data?: KYCDetails; message?: string}> {
  try {
    const access = await verifyOperatorAccess();
    if (!access.success) {
      return {success: false, message: access.message};
    }

    const kyc = await prisma.kYCVerification.findUnique({
      where: {id},
      include: {
        profile: {
          select: {
            email: true,
            user_type: true,
            business_account: {
              select: {
                business_name: true,
              },
            },
          },
        },
      },
    });

    if (!kyc) {
      return {success: false, message: "KYC request not found"};
    }

    // Generate signed URLs for images
    const supabase = createAdminClient();
    let idFileFrontSignedUrl = null;
    let idFileBackSignedUrl = null;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME || "keep";

    if (kyc.id_file_front_url) {
      const {data} = await supabase.storage
        .from(bucketName)
        .createSignedUrl(kyc.id_file_front_url, 3600);
      idFileFrontSignedUrl = data?.signedUrl || null;
    }

    if (kyc.id_file_back_url) {
      const {data} = await supabase.storage
        .from(bucketName)
        .createSignedUrl(kyc.id_file_back_url, 3600);
      idFileBackSignedUrl = data?.signedUrl || null;
    }

    const details: KYCDetails = {
      id: kyc.id,
      profileId: kyc.profile_id,
      firstName: kyc.first_name,
      lastName: kyc.last_name,
      dateOfBirth: kyc.date_of_birth,
      phoneNumber: kyc.phone_number,
      address: kyc.address,
      city: kyc.city,
      province: kyc.province,
      postalCode: kyc.postal_code,
      country: kyc.country,
      idType: kyc.id_type,
      idFileFrontUrl: kyc.id_file_front_url,
      idFileBackUrl: kyc.id_file_back_url,
      status: kyc.status,
      submittedAt: kyc.submitted_at,
      userType: kyc.profile.user_type,
      email: kyc.profile.email,
      idFileFrontSignedUrl,
      idFileBackSignedUrl,
      businessName: kyc.profile.business_account?.business_name,
    };

    return {success: true, data: details};
  } catch (error) {
    console.error("Error fetching KYC details:", error);
    return {success: false, message: "Failed to fetch details"};
  }
}

export async function reviewKYCRequest(
  id: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string
): Promise<{success: boolean; message: string}> {
  try {
    const access = await verifyOperatorAccess();
    if (!access.success) {
      return {success: false, message: access.message};
    }

    // Update the status
    const updatedKYC = await prisma.kYCVerification.update({
      where: {id},
      data: {
        status: status,
        reviewed_at: new Date(),
        reviewed_by: access.userId,
        rejection_reason: status === "REJECTED" ? rejectionReason : null,
      },
    });

    // Log Activity (The operator who reviewed it)
    await logActivity(access.userId, "KYC_REVIEW", {
      kyc_id: id,
      profile_id: updatedKYC.profile_id,
      status: status,
      rejection_reason: rejectionReason,
    });

    revalidatePath("/operator/approvals");
    return {
      success: true,
      message: `KYC request ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error("Error reviewing KYC request:", error);
    return {success: false, message: "Failed to update status"};
  }
}
