"use server";

import {prisma} from "@/utils/prisma";
import {verifyOperatorAccess} from "@/lib/packages";
import {revalidatePath} from "next/cache";
import {createAdminClient} from "@/utils/supabase/admin";
import {logActivity} from "./activity-log";
import {
  MailStatus,
  ActionType,
  ActionStatus,
} from "@/app/generated/prisma/enums";

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
    const fileName = `mail-items/${profileId}/${Date.now()}-${Math.random()
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

    const mailItem = await prisma.mailItem.create({
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

    // Log activity for the operator
    await logActivity(
      access.userId,
      "MAIL_ACTION",
      {
        action: "CREATE_MAIL_ITEM",
        mailItemId: mailItem.id,
        userId: profileId,
        sender: sender,
      },
      "MailItem",
      mailItem.id
    );

    // Log activity for the user who received the mail
    await logActivity(
      profileId,
      "MAIL_ACTION",
      {
        action: "MAIL_RECEIVED",
        mailItemId: mailItem.id,
        sender: sender,
        receivedBy: access.userId,
      },
      "MailItem",
      mailItem.id
    );

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

export async function processOpenScan(
  formData: FormData
): Promise<{success: boolean; message: string}> {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    return {success: false, message: access.message};
  }

  try {
    const mailId = formData.get("mailId") as string;
    const pdfFile = formData.get("file") as File;

    if (!mailId || !pdfFile) {
      return {success: false, message: "Missing required fields"};
    }

    // Get mail item to check ownership/existence
    const mailItem = await prisma.mailItem.findUnique({
      where: {id: mailId},
    });

    if (!mailItem) {
      return {success: false, message: "Mail item not found"};
    }

    // Check if mail item already has a full scan
    if (mailItem.has_full_scan && mailItem.status === MailStatus.SCANNED) {
      return {
        success: false,
        message: "This mail item has already been scanned",
      };
    }

    // Check for existing pending or in-progress scan requests
    const existingRequest = await prisma.mailActionRequest.findFirst({
      where: {
        mail_item_id: mailId,
        action_type: ActionType.OPEN_AND_SCAN,
        status: {
          in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS],
        },
      },
    });

    if (!existingRequest) {
      return {
        success: false,
        message: "No pending scan request found for this mail item",
      };
    }

    // Upload PDF to Supabase
    const supabase = createAdminClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME || "keep";
    const fileExt = pdfFile.name.split(".").pop();
    const fileName = `mail-items/${
      mailItem.profile_id
    }/scans/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    const {data: uploadData, error: uploadError} = await supabase.storage
      .from(bucketName)
      .upload(fileName, pdfFile, {
        contentType: pdfFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {success: false, message: "Failed to upload scan file"};
    }

    // Update Mail Item and any pending Open & Scan requests
    await prisma.$transaction(async (tx) => {
      // Update Mail Item
      await tx.mailItem.update({
        where: {id: mailId},
        data: {
          status: MailStatus.SCANNED,
          has_full_scan: true,
          full_scan_url: uploadData.path,
          updated_at: new Date(),
        },
      });

      // Find and update pending action requests
      // We look for PENDING or IN_PROGRESS requests of type OPEN_AND_SCAN
      const pendingRequests = await tx.mailActionRequest.findMany({
        where: {
          mail_item_id: mailId,
          action_type: ActionType.OPEN_AND_SCAN,
          status: {in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS]},
        },
      });

      for (const req of pendingRequests) {
        await tx.mailActionRequest.update({
          where: {id: req.id},
          data: {
            status: ActionStatus.COMPLETED,
            processed_at: new Date(),
            processed_by: access.userId,
            completed_at: new Date(),
          },
        });
      }
    });

    // Log activity for the operator
    await logActivity(
      access.userId,
      "MAIL_ACTION",
      {
        action: "PROCESS_SCAN",
        mailItemId: mailId,
        userId: mailItem.profile_id,
        actionRequestId: existingRequest.id,
      },
      "MailItem",
      mailId
    );

    // Log activity for the user who owns the mail item
    if (mailItem.profile_id) {
      await logActivity(
        mailItem.profile_id,
        "MAIL_ACTION",
        {
          action: "SCAN_COMPLETED",
          mailItemId: mailId,
          processedBy: access.userId,
        },
        "MailItem",
        mailId
      );
    }

    revalidatePath(`/operator/queue/${mailId}`);
    // Also revalidate the user's inbox view of this item
    revalidatePath(`/app/inbox/${mailId}`);

    return {success: true, message: "Mail item scanned successfully"};
  } catch (error) {
    console.error("Error processing scan:", error);
    return {success: false, message: "Failed to process scan"};
  }
}

export async function processForward(
  formData: FormData
): Promise<{success: boolean; message: string}> {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    return {success: false, message: access.message};
  }

  try {
    const mailId = formData.get("mailId") as string;
    const forwardingAddress = formData.get("forwardingAddress") as string;
    const trackingNumber = formData.get("trackingNumber") as string;
    const notes = formData.get("notes") as string | null;

    if (!mailId || !forwardingAddress || !trackingNumber) {
      return {success: false, message: "Missing required fields"};
    }

    // Get mail item to check ownership/existence
    const mailItem = await prisma.mailItem.findUnique({
      where: {id: mailId},
    });

    if (!mailItem) {
      return {success: false, message: "Mail item not found"};
    }

    // Check for existing pending or in-progress forward requests
    const existingRequest = await prisma.mailActionRequest.findFirst({
      where: {
        mail_item_id: mailId,
        action_type: ActionType.FORWARD,
        status: {
          in: [
            ActionStatus.PENDING,
            ActionStatus.IN_PROGRESS,
            ActionStatus.APPROVED,
          ],
        },
      },
    });

    if (!existingRequest) {
      return {
        success: false,
        message: "No pending forward request found for this mail item",
      };
    }

    // Update Mail Item and forward request
    await prisma.$transaction(async (tx) => {
      // Update Mail Item
      await tx.mailItem.update({
        where: {id: mailId},
        data: {
          status: MailStatus.FORWARDED,
          updated_at: new Date(),
        },
      });

      // Update the forward request
      await tx.mailActionRequest.update({
        where: {id: existingRequest.id},
        data: {
          status: ActionStatus.COMPLETED,
          forward_address: forwardingAddress,
          forward_tracking_number: trackingNumber,
          notes: notes || undefined,
          processed_at: new Date(),
          processed_by: access.userId,
          completed_at: new Date(),
        },
      });
    });

    // Log activity for the operator
    await logActivity(
      access.userId,
      "MAIL_ACTION",
      {
        action: "PROCESS_FORWARD",
        mailItemId: mailId,
        userId: mailItem.profile_id,
        actionRequestId: existingRequest.id,
        forwardingAddress: forwardingAddress,
        trackingNumber: trackingNumber,
      },
      "MailItem",
      mailId
    );

    // Log activity for the user who owns the mail item
    if (mailItem.profile_id) {
      await logActivity(
        mailItem.profile_id,
        "MAIL_ACTION",
        {
          action: "FORWARD_COMPLETED",
          mailItemId: mailId,
          processedBy: access.userId,
          forwardingAddress: forwardingAddress,
          trackingNumber: trackingNumber,
        },
        "MailItem",
        mailId
      );
    }

    revalidatePath(`/operator/queue/${mailId}`);
    revalidatePath(`/app/inbox/${mailId}`);

    return {success: true, message: "Mail item forwarded successfully"};
  } catch (error) {
    console.error("Error processing forward:", error);
    return {success: false, message: "Failed to process forward"};
  }
}

export async function processShred(
  formData: FormData
): Promise<{success: boolean; message: string}> {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    return {success: false, message: access.message};
  }

  try {
    const mailId = formData.get("mailId") as string;

    if (!mailId) {
      return {success: false, message: "Missing required fields"};
    }

    // Get mail item to check ownership/existence
    const mailItem = await prisma.mailItem.findUnique({
      where: {id: mailId},
    });

    if (!mailItem) {
      return {success: false, message: "Mail item not found"};
    }

    // Check for existing pending or in-progress shred requests
    const existingRequest = await prisma.mailActionRequest.findFirst({
      where: {
        mail_item_id: mailId,
        action_type: ActionType.SHRED,
        status: {
          in: [
            ActionStatus.PENDING,
            ActionStatus.IN_PROGRESS,
            ActionStatus.APPROVED,
          ],
        },
      },
    });

    if (!existingRequest) {
      return {
        success: false,
        message: "No pending shred request found for this mail item",
      };
    }

    // Update Mail Item and shred request
    await prisma.$transaction(async (tx) => {
      // Update Mail Item
      await tx.mailItem.update({
        where: {id: mailId},
        data: {
          status: MailStatus.SHREDDED,
          updated_at: new Date(),
        },
      });

      // Update the shred request
      await tx.mailActionRequest.update({
        where: {id: existingRequest.id},
        data: {
          status: ActionStatus.COMPLETED,
          processed_at: new Date(),
          processed_by: access.userId,
          completed_at: new Date(),
        },
      });
    });

    // Log activity for the operator
    await logActivity(
      access.userId,
      "MAIL_ACTION",
      {
        action: "PROCESS_SHRED",
        mailItemId: mailId,
        userId: mailItem.profile_id,
        actionRequestId: existingRequest.id,
      },
      "MailItem",
      mailId
    );

    // Log activity for the user who owns the mail item
    if (mailItem.profile_id) {
      await logActivity(
        mailItem.profile_id,
        "MAIL_ACTION",
        {
          action: "SHRED_COMPLETED",
          mailItemId: mailId,
          processedBy: access.userId,
        },
        "MailItem",
        mailId
      );
    }

    revalidatePath(`/operator/queue/${mailId}`);
    revalidatePath(`/app/inbox/${mailId}`);

    return {success: true, message: "Mail item shredded successfully"};
  } catch (error) {
    console.error("Error processing shred:", error);
    return {success: false, message: "Failed to process shred"};
  }
}

export async function getMailItemDetails(mailId: string) {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    throw new Error(access.message);
  }

  try {
    const mailItem = await prisma.mailItem.findUnique({
      where: {id: mailId},
      include: {
        profile: {
          select: {
            id: true,
            email: true,
            user_type: true,
            kyc_verification: {
              select: {
                status: true,
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
        },
        business_account: {
          select: {
            id: true,
            business_name: true,
          },
        },
        action_requests: {
          where: {
            status: {
              in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS],
            },
          },
          orderBy: {created_at: "desc"},
          take: 1,
        },
      },
    });

    if (!mailItem) return null;

    const latestRequest = mailItem.action_requests[0];
    const kycStatus = mailItem.profile?.kyc_verification?.status;
    const kycApproved = kycStatus === "APPROVED";

    // Signed URLs for envelope/scan
    const supabase = createAdminClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME || "keep";

    let envelopeUrl = null;
    if (mailItem.envelope_scan_url) {
      const {data} = await supabase.storage
        .from(bucketName)
        .createSignedUrl(mailItem.envelope_scan_url, 3600);
      envelopeUrl = data?.signedUrl;
    }

    return {
      id: mailItem.id,
      userId: mailItem.profile?.id,
      userName: mailItem.profile?.kyc_verification
        ? `${mailItem.profile.kyc_verification.first_name} ${mailItem.profile.kyc_verification.last_name}`
        : mailItem.profile?.email,
      userType: mailItem.profile?.user_type,
      sender: mailItem.sender,
      subject: mailItem.subject,
      receivedAt: mailItem.received_at,
      status: mailItem.status,
      envelopeScanUrl: envelopeUrl,
      hasFullScan: mailItem.has_full_scan,
      kycApproved: kycApproved,
      actionRequest: latestRequest
        ? {
            id: latestRequest.id,
            type: latestRequest.action_type,
            status: latestRequest.status,
            priority: "standard", // Default for now
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching mail item details:", error);
    return null;
  }
}

export async function getActionQueue() {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    throw new Error(access.message);
  }

  try {
    const actionRequests = await prisma.mailActionRequest.findMany({
      where: {
        status: {
          in: [
            ActionStatus.PENDING,
            ActionStatus.IN_PROGRESS,
            ActionStatus.APPROVED,
          ],
        },
        action_type: {
          in: [ActionType.OPEN_AND_SCAN, ActionType.FORWARD, ActionType.SHRED],
        },
      },
      include: {
        mail_item: {
          select: {
            id: true,
            sender: true,
            subject: true,
            received_at: true,
            status: true,
            business_account: {
              select: {
                id: true,
                business_name: true,
              },
            },
          },
        },
        profile: {
          select: {
            id: true,
            email: true,
            user_type: true,
            kyc_verification: {
              select: {
                status: true,
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
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return actionRequests.map((req) => {
      const kycStatus = req.profile?.kyc_verification?.status;
      const kycApproved = kycStatus === "APPROVED";
      const userName = req.profile?.kyc_verification
        ? `${req.profile.kyc_verification.first_name} ${req.profile.kyc_verification.last_name}`
        : req.profile?.email || "Unknown User";

      // Map action type from enum to UI format
      const actionTypeMap: Record<ActionType, "scan" | "forward" | "shred"> = {
        OPEN_AND_SCAN: "scan",
        FORWARD: "forward",
        SHRED: "shred",
        HOLD: "forward", // fallback
        ARCHIVE: "forward", // fallback
      };

      // Map status from enum to UI format
      const statusMap: Record<
        ActionStatus,
        "pending" | "in_progress" | "completed" | "requires_approval"
      > = {
        PENDING: "pending",
        IN_PROGRESS: "in_progress",
        COMPLETED: "completed",
        APPROVED: "requires_approval",
        REJECTED: "pending", // fallback
        CANCELLED: "pending", // fallback
      };

      return {
        id: req.id,
        mailItemId: req.mail_item_id,
        userId: req.profile_id,
        userName: userName,
        userType: (req.profile?.user_type?.toLowerCase() || "individual") as
          | "individual"
          | "business",
        actionType: actionTypeMap[req.action_type] || "scan",
        status: statusMap[req.status] || "pending",
        requestedAt: req.created_at.toISOString(), // Serialize date for client
        priority: "medium" as "low" | "medium" | "high", // Default for now
        kycApproved: kycApproved,
        department: req.mail_item.business_account?.business_name || undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching action queue:", error);
    return [];
  }
}
