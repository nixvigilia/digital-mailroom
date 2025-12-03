"use server";

import {prisma} from "@/utils/prisma";
import {createAdminClient} from "@/utils/supabase/admin";
import {verifySession} from "@/utils/supabase/dal";
import {revalidatePath} from "next/cache";
import {UserRole, UserType} from "@/app/generated/prisma/enums";
import {logActivity} from "./activity-log";

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

export type UserData = {
  id: string;
  email: string;
  userType: UserType;
  role: UserRole;
  createdAt: Date;
  firstName?: string;
  lastName?: string;
};

export async function getUsers(
  roleFilter?: UserRole,
  search?: string,
  limit?: number,
  offset?: number
): Promise<{
  success: boolean;
  data?: UserData[];
  total?: number;
  message?: string;
}> {
  try {
    // Verify session and check if user is admin
    await ensureAdmin();

    const where: any = {};

    // Enforce restriction: Only System Admins and Operators
    if (roleFilter) {
      // If a filter is provided, ensure it's one of the allowed roles
      if (
        roleFilter !== UserRole.SYSTEM_ADMIN &&
        roleFilter !== UserRole.OPERATOR
      ) {
        // If they ask for something else, return empty or default to allowed
        // But per requirements, we only list admins and operators.
        where.role = {in: [UserRole.SYSTEM_ADMIN, UserRole.OPERATOR]};
        // Or strictly filter by what they asked if it is in the allowed list
      } else {
        where.role = roleFilter;
      }
    } else {
      // Default: Only System Admins and Operators
      where.role = {
        in: [UserRole.SYSTEM_ADMIN, UserRole.OPERATOR],
      };
    }

    if (search) {
      where.email = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        include: {
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
        orderBy: {
          created_at: "desc",
        },
        ...(limit ? {take: limit} : {}),
        ...(offset ? {skip: offset} : {}),
      }),
      prisma.profile.count({where}),
    ]);

    const formattedUsers: UserData[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      userType: user.user_type,
      role: user.role,
      createdAt: user.created_at,
      firstName:
        user.kyc_verification?.first_name ||
        user.backoffice_profile?.first_name,
      lastName:
        user.kyc_verification?.last_name || user.backoffice_profile?.last_name,
    }));

    return {success: true, data: formattedUsers, total};
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

export async function createOperatorUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{success: boolean; message: string}> {
  try {
    // Verify session and check if user is admin
    const session = await ensureAdmin();

    const supabase = createAdminClient();

    // 1. Create user in Supabase Auth
    const {data: authUser, error: authError} =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return {success: false, message: authError.message};
    }

    if (!authUser.user) {
      return {success: false, message: "Failed to create user in auth system"};
    }

    const userId = authUser.user.id;

    // 2. Create user profile in Database with OPERATOR role
    // Note: If a trigger exists that automatically creates a profile, this step might fail with a unique constraint violation on ID.
    // We use upsert to handle both cases (no trigger vs trigger).
    const profileData = {
      email: email,
      user_type: "OPERATOR" as UserType,
      role: "OPERATOR" as UserRole,
    };

    const backofficeData = {
      first_name: firstName,
      last_name: lastName,
    };

    await prisma.profile.upsert({
      where: {id: userId},
      update: {
        ...profileData,
        backoffice_profile: {
          upsert: {
            create: backofficeData,
            update: backofficeData,
          },
        },
      },
      create: {
        id: userId,
        ...profileData,
        backoffice_profile: {
          create: backofficeData,
        },
      },
    });

    // Log Activity
    await logActivity(session.userId, "CREATE_OPERATOR", {
      new_operator_email: email,
      new_operator_id: userId,
    });

    revalidatePath("/admin/users");
    return {success: true, message: "Operator created successfully"};
  } catch (error) {
    console.error("Error creating operator:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create operator",
    };
  }
}

export async function deleteUser(
  userId: string
): Promise<{success: boolean; message: string}> {
  try {
    const session = await ensureAdmin();
    const supabase = createAdminClient();

    // Get user email for logging before deletion
    const userProfile = await prisma.profile.findUnique({
      where: {id: userId},
      select: {email: true},
    });

    // Delete from Supabase Auth
    const {error: authError} = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      return {success: false, message: authError.message};
    }

    // Delete from Prisma (Profile)
    await prisma.profile.delete({
      where: {id: userId},
    });

    // Log Activity
    await logActivity(session.userId, "DELETE_USER", {
      deleted_user_id: userId,
      deleted_user_email: userProfile?.email,
    });

    revalidatePath("/admin/users");
    return {success: true, message: "User deleted successfully"};
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}
