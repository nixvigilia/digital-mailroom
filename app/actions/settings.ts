"use server";

import {prisma} from "@/utils/prisma";
import {verifySession} from "@/utils/supabase/dal";
import {revalidatePath} from "next/cache";
import {logActivity} from "./activity-log";
import bcrypt from "bcryptjs";

export async function getSettings() {
  try {
    const session = await verifySession();
    const userId = session.userId;

    const profile = await prisma.profile.findUnique({
      where: {id: userId},
      select: {
        email: true,
        notify_new_mail: true,
        notify_referrals: true,
        notify_marketing: true,
        default_forward_address: true,
        shredding_pin_hash: true,
        kyc_verification: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    return {
      success: true,
      data: {
        email: profile.email,
        firstName: profile.kyc_verification?.first_name || "",
        lastName: profile.kyc_verification?.last_name || "",
        defaultForwardAddress: profile.default_forward_address || "",
        hasShreddingPin: !!profile.shredding_pin_hash,
        notifications: {
          newMail: profile.notify_new_mail,
          referrals: profile.notify_referrals,
          marketing: profile.notify_marketing,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {success: false, message: "Failed to fetch settings"};
  }
}

export async function updateNotificationSettings(settings: {
  newMail: boolean;
  referrals: boolean;
  marketing: boolean;
}) {
  try {
    const session = await verifySession();
    const userId = session.userId;

    await prisma.profile.update({
      where: {id: userId},
      data: {
        notify_new_mail: settings.newMail,
        notify_referrals: settings.referrals,
        notify_marketing: settings.marketing,
      },
    });

    await logActivity(userId, "UPDATE_SETTINGS", {
      updated_fields: ["notifications"],
      new_settings: settings,
    });

    revalidatePath("/app/settings");
    return {
      success: true,
      message: "Notification settings updated successfully",
    };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return {success: false, message: "Failed to update notification settings"};
  }
}

export async function updateMailSettings(defaultForwardAddress: string) {
  try {
    const session = await verifySession();
    const userId = session.userId;

    await prisma.profile.update({
      where: {id: userId},
      data: {
        default_forward_address: defaultForwardAddress,
      },
    });

    await logActivity(userId, "UPDATE_SETTINGS", {
      updated_fields: ["default_forward_address"],
      new_value: defaultForwardAddress,
    });

    revalidatePath("/app/settings");
    return {success: true, message: "Mail settings updated successfully"};
  } catch (error) {
    console.error("Error updating mail settings:", error);
    return {success: false, message: "Failed to update mail settings"};
  }
}

export async function setShreddingPin(pin: string) {
  try {
    const session = await verifySession();
    const userId = session.userId;

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      return {success: false, message: "PIN must be 4 digits"};
    }

    const hash = await bcrypt.hash(pin, 10);

    await prisma.profile.update({
      where: {id: userId},
      data: {
        shredding_pin_hash: hash,
      },
    });

    await logActivity(userId, "UPDATE_SETTINGS", {
      updated_fields: ["shredding_pin"],
    });

    revalidatePath("/app/settings");
    return {success: true, message: "Security PIN set successfully"};
  } catch (error) {
    console.error("Error setting security PIN:", error);
    return {success: false, message: "Failed to set Security PIN"};
  }
}
