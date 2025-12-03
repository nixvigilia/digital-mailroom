"use server";

import {prisma} from "@/utils/prisma";
import {verifySession} from "@/utils/supabase/dal";
import {revalidatePath} from "next/cache";

export type ActivityLogAction =
  | "LOGIN"
  | "LOGOUT"
  | "SIGNUP"
  | "UPDATE_PROFILE"
  | "CREATE_OPERATOR"
  | "DELETE_USER"
  | "CREATE_PACKAGE"
  | "UPDATE_PACKAGE"
  | "DELETE_PACKAGE"
  | "KYC_SUBMIT"
  | "KYC_REVIEW"
  | "MAIL_ACTION"
  | "OTHER";

export type ActivityLogData = {
  id: string;
  profileId: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: any;
  ipAddress: string | null;
  createdAt: Date;
  userEmail?: string;
  userName?: string;
};

/**
 * Logs a user activity
 */
export async function logActivity(
  userId: string,
  action: ActivityLogAction,
  details?: any,
  entityType?: string,
  entityId?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        profile_id: userId,
        action,
        details: details || {},
        entity_type: entityType,
        entity_id: entityId,
        // ip_address and user_agent would typically come from headers/request context
        // but in server actions we might not have direct access unless passed
        // We'll leave them null for now or handle them if we pass request context
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw, logging failure shouldn't block the main action
  }
}

/**
 * Fetches activity logs for a specific user or all users (admin only)
 */
export async function getActivityLogs(
  targetUserId?: string,
  limit = 20,
  offset = 0,
  search?: string
): Promise<{
  success: boolean;
  data?: ActivityLogData[];
  total?: number;
  message?: string;
}> {
  try {
    const session = await verifySession();

    // Check if requester is admin if they are requesting logs for others or all logs
    if (!targetUserId || targetUserId !== session.userId) {
      const requester = await prisma.profile.findUnique({
        where: {id: session.userId},
        select: {role: true},
      });

      const isAdmin =
        requester?.role === "SYSTEM_ADMIN" || requester?.role === "OPERATOR";

      if (!isAdmin) {
        return {success: false, message: "Unauthorized"};
      }
    }

    const where: any = {};
    if (targetUserId) {
      where.profile_id = targetUserId;
    }

    if (search) {
      where.OR = [
        {
          action: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          profile: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          profile: {
            select: {
              email: true,
              kyc_verification: {
                select: {
                  first_name: true,
                  last_name: true,
                },
              },
              backoffice_profile: {
                select: {
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count({where}),
    ]);

    const formattedLogs: ActivityLogData[] = logs.map((log) => {
      let userName = "N/A";
      if (log.profile.kyc_verification) {
        userName = `${log.profile.kyc_verification.first_name} ${log.profile.kyc_verification.last_name}`;
      } else if (log.profile.backoffice_profile) {
        userName = `${log.profile.backoffice_profile.first_name} ${log.profile.backoffice_profile.last_name}`;
      }

      return {
      id: log.id,
      profileId: log.profile_id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      details: log.details,
      ipAddress: log.ip_address,
      createdAt: log.created_at,
      userEmail: log.profile.email,
        userName: userName,
      };
    });

    return {success: true, data: formattedLogs, total};
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch logs",
    };
  }
}
