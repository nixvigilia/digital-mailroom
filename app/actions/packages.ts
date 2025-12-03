"use server";

import {prisma} from "@/utils/prisma";
import {revalidatePath} from "next/cache";
import {verifyOperatorAccess} from "@/lib/packages";

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
  cashbackPercentage?: number; // New field
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
        cashback_percentage: formData.cashbackPercentage || 5.0, // Default 5%
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
        cashback_percentage: formData.cashbackPercentage, // Update cashback
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
      cashbackPercentage: Number(pkg.cashback_percentage), // Include cashback
    }));
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}
