"use server";

import {prisma} from "@/utils/prisma";
import {verifyOperatorAccess} from "@/lib/packages";
import {revalidatePath} from "next/cache";
import {createAdminClient} from "@/utils/supabase/admin";
import {MailStatus} from "@/app/generated/prisma/enums";

export type UserSearchResult = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName?: string | null;
  userType: string;
};

export async function searchUsers(
  query: string
): Promise<{success: boolean; data?: UserSearchResult[]; message?: string}> {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    return {success: false, message: access.message};
  }

  if (!query || query.length < 2) {
    return {success: true, data: []};
  }

  try {
    const users = await prisma.profile.findMany({
      where: {
        OR: [
          {email: {contains: query, mode: "insensitive"}},
          {
            kyc_verification: {
              OR: [
                {first_name: {contains: query, mode: "insensitive"}},
                {last_name: {contains: query, mode: "insensitive"}},
              ],
            },
          },
          {
            business_account: {
              business_name: {contains: query, mode: "insensitive"},
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        user_type: true,
        kyc_verification: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        business_account: {
          select: {
            business_name: true,
          },
        },
      },
      take: 10,
    });

    const results: UserSearchResult[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.kyc_verification?.first_name || null,
      lastName: user.kyc_verification?.last_name || null,
      businessName: user.business_account?.business_name || null,
      userType: user.user_type,
    }));

    return {success: true, data: results};
  } catch (error) {
    console.error("Error searching users:", error);
    return {success: false, message: "Failed to search users"};
  }
}

export async function createMailItem(
  formData: FormData
): Promise<{success: boolean; message: string}> {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    return {success: false, message: access.message};
  }

  try {
    const sender = formData.get("sender") as string;
    const profileId = formData.get("profileId") as string;
    const imageFile = formData.get("image") as File;
    const notes = formData.get("notes") as string | null;

    if (!sender || !profileId || !imageFile) {
      return {success: false, message: "Missing required fields"};
    }

    // Upload image to Supabase
    const supabase = createAdminClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME || "keep";
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `mail-items/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    const {data: uploadData, error: uploadError} = await supabase.storage
      .from(bucketName)
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {success: false, message: "Failed to upload image"};
    }

    // Get business account ID if applicable
    const profile = await prisma.profile.findUnique({
      where: {id: profileId},
      include: {business_account: true},
    });

    await prisma.mailItem.create({
      data: {
        sender,
        profile_id: profileId,
        business_account_id: profile?.business_account?.id,
        received_at: new Date(),
        status: MailStatus.RECEIVED,
        envelope_scan_url: uploadData.path,
        notes: notes || undefined,
        // Optional: add tracking/barcodes if we add fields to schema later
      },
    });

    revalidatePath("/operator/receive");
    return {
      success: true,
      message: "Mail item received and logged successfully",
    };
  } catch (error) {
    console.error("Error creating mail item:", error);
    return {success: false, message: "Failed to create mail item"};
  }
}
