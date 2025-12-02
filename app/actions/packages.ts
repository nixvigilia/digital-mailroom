"use server";

import {verifySession} from "@/utils/supabase/dal";
import {prisma} from "@/utils/prisma";
import {revalidatePath} from "next/cache";
import {UserRole} from "../generated/prisma/enums";

export type ActionResult<T = void> =
  | {success: true; message: string; data?: T}
  | {success: false; message: string};

export interface PackageFormData {
  name: string;
  planType: string;
  description?: string;
  priceMonthly: number;
  priceQuarterly?: number;
  priceYearly?: number;
  features: string[];
  maxMailItems?: number;
  maxTeamMembers?: number;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

/**
 * Verifies that the current user is an operator or admin
 */
async function verifyOperatorAccess(): Promise<
  {success: true; userId: string} | {success: false; message: string}
> {
  const session = await verifySession();
  const userId = session.userId;

  const profile = await prisma.profile.findUnique({
    where: {id: userId},
    select: {role: true, user_type: true},
  });

  if (!profile) {
    return {success: false, message: "User profile not found."};
  }

  const isOperator =
    profile.role === UserRole.OPERATOR ||
    profile.role === UserRole.SYSTEM_ADMIN;
  const isAdmin =
    profile.user_type === "OPERATOR" || profile.user_type === "ADMIN";

  if (!isOperator && !isAdmin) {
    return {success: false, message: "Unauthorized. Operator access required."};
  }

  return {success: true, userId};
}

/**
 * Creates a new package/pricing plan
 */
export async function createPackage(
  formData: PackageFormData
): Promise<ActionResult<{id: string}>> {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    return access;
  }

  try {
    // Validate required fields
    if (!formData.name || !formData.planType || !formData.priceMonthly) {
      return {
        success: false,
        message:
          "Please fill in all required fields (name, plan type, monthly price).",
      };
    }

    // Validate plan type (must be non-empty)
    if (!formData.planType || formData.planType.trim().length === 0) {
      return {
        success: false,
        message: "Plan type is required and cannot be empty.",
      };
    }

    // Normalize plan type (trim and optionally uppercase)
    const normalizedPlanType = formData.planType.trim().toUpperCase();

    // Check if plan type already exists
    const existingPackage = await prisma.package.findUnique({
      where: {plan_type: normalizedPlanType},
    });

    if (existingPackage) {
      return {
        success: false,
        message: `A package with plan type "${formData.planType}" already exists.`,
      };
    }

    // Create package
    const packageData = await prisma.package.create({
      data: {
        name: formData.name,
        plan_type: normalizedPlanType,
        description: formData.description || null,
        price_monthly: formData.priceMonthly,
        price_quarterly: formData.priceQuarterly || null,
        price_yearly: formData.priceYearly || null,
        features: formData.features || [],
        max_mail_items: formData.maxMailItems || null,
        max_team_members: formData.maxTeamMembers || null,
        is_active: formData.isActive,
        is_featured: formData.isFeatured,
        display_order: formData.displayOrder,
        created_by: access.userId,
      },
    });

    revalidatePath("/operator/packages");
    return {
      success: true,
      message: "Package created successfully.",
      data: {id: packageData.id},
    };
  } catch (error) {
    console.error("Error creating package:", error);
    return {
      success: false,
      message: "Failed to create package. Please try again.",
    };
  }
}

/**
 * Updates an existing package
 */
export async function updatePackage(
  packageId: string,
  formData: PackageFormData
): Promise<ActionResult> {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    return access;
  }

  try {
    // Validate required fields
    if (!formData.name || !formData.planType || !formData.priceMonthly) {
      return {
        success: false,
        message:
          "Please fill in all required fields (name, plan type, monthly price).",
      };
    }

    // Check if package exists
    const existingPackage = await prisma.package.findUnique({
      where: {id: packageId},
    });

    if (!existingPackage) {
      return {
        success: false,
        message: "Package not found.",
      };
    }

    // Validate plan type (must be non-empty)
    if (!formData.planType || formData.planType.trim().length === 0) {
      return {
        success: false,
        message: "Plan type is required and cannot be empty.",
      };
    }

    // Normalize plan type (trim and optionally uppercase)
    const normalizedPlanType = formData.planType.trim().toUpperCase();

    // Check if plan type is being changed and if it conflicts with another package
    if (existingPackage.plan_type !== normalizedPlanType) {
      const conflictingPackage = await prisma.package.findUnique({
        where: {plan_type: normalizedPlanType},
      });

      if (conflictingPackage) {
        return {
          success: false,
          message: `A package with plan type "${formData.planType}" already exists.`,
        };
      }
    }

    // Update package
    await prisma.package.update({
      where: {id: packageId},
      data: {
        name: formData.name,
        plan_type: normalizedPlanType,
        description: formData.description || null,
        price_monthly: formData.priceMonthly,
        price_quarterly: formData.priceQuarterly || null,
        price_yearly: formData.priceYearly || null,
        features: formData.features || [],
        max_mail_items: formData.maxMailItems || null,
        max_team_members: formData.maxTeamMembers || null,
        is_active: formData.isActive,
        is_featured: formData.isFeatured,
        display_order: formData.displayOrder,
      },
    });

    revalidatePath("/operator/packages");
    return {
      success: true,
      message: "Package updated successfully.",
    };
  } catch (error) {
    console.error("Error updating package:", error);
    return {
      success: false,
      message: "Failed to update package. Please try again.",
    };
  }
}

/**
 * Deletes a package
 */
export async function deletePackage(packageId: string): Promise<ActionResult> {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    return access;
  }

  try {
    // Check if package exists
    const existingPackage = await prisma.package.findUnique({
      where: {id: packageId},
      include: {
        subscriptions: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

    if (!existingPackage) {
      return {
        success: false,
        message: "Package not found.",
      };
    }

    // Check if package has active subscriptions
    if (existingPackage.subscriptions.length > 0) {
      return {
        success: false,
        message:
          "Cannot delete package with active subscriptions. Please deactivate it instead.",
      };
    }

    // Delete package
    await prisma.package.delete({
      where: {id: packageId},
    });

    revalidatePath("/operator/packages");
    return {
      success: true,
      message: "Package deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting package:", error);
    return {
      success: false,
      message: "Failed to delete package. Please try again.",
    };
  }
}

/**
 * Gets all packages (public - for pricing page)
 */
export async function getPublicPackages() {
  try {
    const packages = await prisma.package.findMany({
      where: {
        is_active: true,
      },
      orderBy: [{display_order: "asc"}, {created_at: "desc"}],
    });

    return packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      plan_type: pkg.plan_type,
      description: pkg.description,
      price_monthly: Number(pkg.price_monthly),
      price_quarterly: pkg.price_quarterly ? Number(pkg.price_quarterly) : null,
      price_yearly: pkg.price_yearly ? Number(pkg.price_yearly) : null,
      features: pkg.features,
      max_mail_items: pkg.max_mail_items,
      max_team_members: pkg.max_team_members,
      is_active: pkg.is_active,
      is_featured: pkg.is_featured,
      display_order: pkg.display_order,
    }));
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

/**
 * Gets all packages (operator only)
 */
export async function getPackages() {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    return [];
  }

  try {
    const packages = await prisma.package.findMany({
      orderBy: [{display_order: "asc"}, {created_at: "desc"}],
    });

    return packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      planType: pkg.plan_type,
      description: pkg.description,
      priceMonthly: Number(pkg.price_monthly),
      priceQuarterly: pkg.price_quarterly ? Number(pkg.price_quarterly) : null,
      priceYearly: pkg.price_yearly ? Number(pkg.price_yearly) : null,
      features: pkg.features,
      maxMailItems: pkg.max_mail_items,
      maxTeamMembers: pkg.max_team_members,
      isActive: pkg.is_active,
      isFeatured: pkg.is_featured,
      displayOrder: pkg.display_order,
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

/**
 * Gets a single package by ID
 */
export async function getPackage(packageId: string) {
  const access = await verifyOperatorAccess();
  if (!access.success) {
    return null;
  }

  try {
    const pkg = await prisma.package.findUnique({
      where: {id: packageId},
    });

    if (!pkg) {
      return null;
    }

    return {
      id: pkg.id,
      name: pkg.name,
      planType: pkg.plan_type,
      description: pkg.description,
      priceMonthly: Number(pkg.price_monthly),
      priceQuarterly: pkg.price_quarterly ? Number(pkg.price_quarterly) : null,
      priceYearly: pkg.price_yearly ? Number(pkg.price_yearly) : null,
      features: pkg.features,
      maxMailItems: pkg.max_mail_items,
      maxTeamMembers: pkg.max_team_members,
      isActive: pkg.is_active,
      isFeatured: pkg.is_featured,
      displayOrder: pkg.display_order,
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at,
    };
  } catch (error) {
    console.error("Error fetching package:", error);
    return null;
  }
}

/**
 * Gets the data (description + features) of the FREE plan
 */
export async function getFreePlanData(): Promise<{
  description: string | null;
  features: string[];
} | null> {
  try {
    const freePlan = await prisma.package.findUnique({
      where: {plan_type: "FREE"},
    });

    if (!freePlan) {
      return null;
    }

    return {
      description: freePlan.description,
      features: freePlan.features || [],
    };
  } catch (error) {
    console.error("Error fetching free plan data:", error);
    return null;
  }
}
