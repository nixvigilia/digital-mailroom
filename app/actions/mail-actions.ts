"use server";

import {prisma} from "@/utils/prisma";
import {verifySession} from "@/utils/supabase/dal";
import {revalidatePath} from "next/cache";
import {logActivity} from "./activity-log";
import {ActionType, ActionStatus} from "@/app/generated/prisma/enums";
import bcrypt from "bcryptjs";

// Helper to check if user has shredding PIN
export async function checkShreddingPin(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: {id: userId},
    select: {shredding_pin_hash: true},
  });
  return !!profile?.shredding_pin_hash;
}

// Verify PIN (simple check against stored hash - in real app use bcrypt)
// For this demo/MVP we'll store it simply or use a basic hash if needed.
// Since user asked for "4 digit code", we can store it directly if we assume app-level security or use bcrypt.
// Given constraints, let's use bcrypt if available or simple comparison if not.
// We should probably use bcryptjs or similar.
// Let's assume we'll handle hashing in the setting/verification action.
// For now, I'll import bcrypt.

export async function verifyShreddingPin(userId: string, pin: string) {
  const profile = await prisma.profile.findUnique({
    where: {id: userId},
    select: {shredding_pin_hash: true},
  });

  if (!profile?.shredding_pin_hash) return false;
  return await bcrypt.compare(pin, profile.shredding_pin_hash);
}

// Check if there's a pending scan request for a mail item
export async function checkPendingScanRequest(mailId: string) {
  try {
    const session = await verifySession();

    const pendingRequest = await prisma.mailActionRequest.findFirst({
      where: {
        mail_item_id: mailId,
        profile_id: session.userId,
        action_type: ActionType.OPEN_AND_SCAN,
        status: {
          in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS],
        },
      },
      orderBy: {created_at: "desc"},
    });

    return pendingRequest
      ? {
          hasPendingRequest: true,
          status: pendingRequest.status,
          requestedAt: pendingRequest.created_at,
        }
      : {hasPendingRequest: false};
  } catch (error) {
    console.error("Error checking pending scan request:", error);
    return {hasPendingRequest: false};
  }
}

export async function requestOpenScan(mailId: string) {
  try {
    const session = await verifySession();

    // Verify ownership
    const mailItem = await prisma.mailItem.findUnique({
      where: {id: mailId, profile_id: session.userId},
    });

    if (!mailItem) throw new Error("Mail item not found");

    // Check if mail item already has a full scan
    if (mailItem.has_full_scan) {
      return {
        success: false,
        message: "This mail item already has a full scan",
      };
    }

    // Check for existing pending or in-progress scan requests
    const existingRequest = await prisma.mailActionRequest.findFirst({
      where: {
        mail_item_id: mailId,
        profile_id: session.userId,
        action_type: ActionType.OPEN_AND_SCAN,
        status: {
          in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS],
        },
      },
    });

    if (existingRequest) {
      return {
        success: false,
        message: "A scan request is already pending for this mail item",
      };
    }

    // Create request
    await prisma.mailActionRequest.create({
      data: {
        mail_item_id: mailId,
        profile_id: session.userId,
        action_type: ActionType.OPEN_AND_SCAN,
        status: ActionStatus.PENDING,
      },
    });

    await logActivity(session.userId, "REQUEST_SCAN", {mailId});
    revalidatePath(`/app/inbox/${mailId}`);
    return {success: true, message: "Scan requested successfully"};
  } catch (error) {
    console.error("Error requesting scan:", error);
    return {success: false, message: "Failed to request scan"};
  }
}

export async function requestForward(
  mailId: string,
  address: string,
  notes?: string
) {
  try {
    const session = await verifySession();

    const mailItem = await prisma.mailItem.findUnique({
      where: {id: mailId, profile_id: session.userId},
    });

    if (!mailItem) throw new Error("Mail item not found");

    await prisma.mailActionRequest.create({
      data: {
        mail_item_id: mailId,
        profile_id: session.userId,
        action_type: ActionType.FORWARD,
        status: "PENDING",
        forward_address: address,
        notes: notes,
      },
    });

    await logActivity(session.userId, "REQUEST_FORWARD", {mailId, address});
    revalidatePath(`/app/inbox/${mailId}`);
    return {success: true, message: "Forward requested successfully"};
  } catch (error) {
    console.error("Error requesting forward:", error);
    return {success: false, message: "Failed to request forward"};
  }
}

export async function requestHold(mailId: string, notes: string) {
  try {
    const session = await verifySession();

    const mailItem = await prisma.mailItem.findUnique({
      where: {id: mailId, profile_id: session.userId},
    });

    if (!mailItem) throw new Error("Mail item not found");

    await prisma.mailActionRequest.create({
      data: {
        mail_item_id: mailId,
        profile_id: session.userId,
        action_type: ActionType.HOLD,
        status: "PENDING",
        notes: notes,
      },
    });

    await logActivity(session.userId, "REQUEST_HOLD", {mailId});
    revalidatePath(`/app/inbox/${mailId}`);
    return {success: true, message: "Hold requested successfully"};
  } catch (error) {
    console.error("Error requesting hold:", error);
    return {success: false, message: "Failed to request hold"};
  }
}

export async function requestShred(mailId: string, pin: string) {
  try {
    const session = await verifySession();

    // Verify PIN
    const isValid = await verifyShreddingPin(session.userId, pin);
    if (!isValid) {
      return {success: false, message: "Invalid PIN"};
    }

    const mailItem = await prisma.mailItem.findUnique({
      where: {id: mailId, profile_id: session.userId},
    });

    if (!mailItem) throw new Error("Mail item not found");

    await prisma.mailActionRequest.create({
      data: {
        mail_item_id: mailId,
        profile_id: session.userId,
        action_type: ActionType.SHRED,
        status: "PENDING",
      },
    });

    await logActivity(session.userId, "REQUEST_SHRED", {mailId});
    revalidatePath(`/app/inbox/${mailId}`);
    return {success: true, message: "Shredding requested successfully"};
  } catch (error) {
    console.error("Error requesting shred:", error);
    return {success: false, message: "Failed to request shred"};
  }
}
