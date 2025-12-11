"use server";

import {prisma} from "@/utils/prisma";
import {verifySession} from "@/utils/supabase/dal";
import {revalidatePath} from "next/cache";
import {UserRole} from "@/app/generated/prisma/enums";
import {logActivity} from "./activity-log";
import {z} from "zod";

// Helper to ensure the user is an admin
async function ensureAdmin() {
  const session = await verifySession();
  const profile = await prisma.profile.findUnique({
    where: {id: session.userId},
    select: {role: true},
  });

  if (profile?.role !== UserRole.SYSTEM_ADMIN) {
    throw new Error("Unauthorized: Access restricted to administrators.");
  }
  return session;
}

// Validation schema for IP address
const ipAddressSchema = z
  .string()
  .min(1, "IP address is required")
  .regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
    "Please enter a valid IPv4 or IPv6 address"
  );

export type AllowedIPData = {
  id: string;
  ip_address: string;
  description: string | null;
  created_at: Date;
  created_by: string | null;
};

export async function getAllowedIPs(): Promise<{
  success: boolean;
  data?: AllowedIPData[];
  message?: string;
}> {
  try {
    await ensureAdmin();

    const allowedIPs = await prisma.allowedIP.findMany({
      orderBy: {created_at: "desc"},
    });

    return {
      success: true,
      data: allowedIPs.map((ip) => ({
        id: ip.id,
        ip_address: ip.ip_address,
        description: ip.description,
        created_at: ip.created_at,
        created_by: ip.created_by,
      })),
    };
  } catch (error) {
    console.error("Error fetching allowed IPs:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch allowed IPs",
    };
  }
}

export async function createAllowedIP(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await ensureAdmin();

    const ipAddress = formData.get("ip_address") as string;
    const description = formData.get("description") as string | null;

    // Validate IP address
    const validation = ipAddressSchema.safeParse(ipAddress);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors[0]?.message || "Invalid IP address",
      };
    }

    // Check if IP already exists
    const existing = await prisma.allowedIP.findUnique({
      where: {ip_address: ipAddress},
    });

    if (existing) {
      return {
        success: false,
        message: "This IP address is already in the whitelist",
      };
    }

    // Create the allowed IP
    await prisma.allowedIP.create({
      data: {
        ip_address: ipAddress,
        description: description || null,
        created_by: session.userId,
      },
    });

    await logActivity(session.userId, "IP_WHITELIST_CREATE", {
      ip_address: ipAddress,
      description: description,
    });

    revalidatePath("/admin/ip-whitelist");
    return {
      success: true,
      message: "IP address added to whitelist successfully",
    };
  } catch (error) {
    console.error("Error creating allowed IP:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to add IP address to whitelist",
    };
  }
}

export async function updateAllowedIP(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await ensureAdmin();

    const id = formData.get("id") as string;
    const ipAddress = formData.get("ip_address") as string;
    const description = formData.get("description") as string | null;

    if (!id) {
      return {
        success: false,
        message: "IP record ID is required",
      };
    }

    // Validate IP address
    const validation = ipAddressSchema.safeParse(ipAddress);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors[0]?.message || "Invalid IP address",
      };
    }

    // Check if IP already exists (excluding current record)
    const existing = await prisma.allowedIP.findUnique({
      where: {ip_address: ipAddress},
    });

    if (existing && existing.id !== id) {
      return {
        success: false,
        message: "This IP address is already in the whitelist",
      };
    }

    // Update the allowed IP
    await prisma.allowedIP.update({
      where: {id},
      data: {
        ip_address: ipAddress,
        description: description || null,
      },
    });

    const session = await verifySession();
    await logActivity(session.userId, "IP_WHITELIST_UPDATE", {
      ip_id: id,
      ip_address: ipAddress,
      description: description,
    });

    revalidatePath("/admin/ip-whitelist");
    return {
      success: true,
      message: "IP address updated successfully",
    };
  } catch (error) {
    console.error("Error updating allowed IP:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update IP address",
    };
  }
}

export async function deleteAllowedIP(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await ensureAdmin();

    // Get IP address before deletion for logging
    const ipRecord = await prisma.allowedIP.findUnique({
      where: {id},
      select: {ip_address: true},
    });

    if (!ipRecord) {
      return {
        success: false,
        message: "IP address not found",
      };
    }

    await prisma.allowedIP.delete({
      where: {id},
    });

    await logActivity(session.userId, "IP_WHITELIST_DELETE", {
      ip_id: id,
      ip_address: ipRecord.ip_address,
    });

    revalidatePath("/admin/ip-whitelist");
    return {
      success: true,
      message: "IP address removed from whitelist successfully",
    };
  } catch (error) {
    console.error("Error deleting allowed IP:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to remove IP address from whitelist",
    };
  }
}

