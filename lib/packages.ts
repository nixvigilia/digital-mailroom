import "server-only";
import {prisma} from "@/utils/prisma";
import {verifySession} from "@/utils/supabase/dal";
import {UserRole} from "@/app/generated/prisma/enums";

/**
 * Verifies that the current user is an operator or admin
 */
export async function verifyOperatorAccess(): Promise<
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
      not_included: pkg.not_included,
      max_scanned_pages: pkg.max_scanned_pages,
      retention_days: pkg.retention_days,
      max_storage_items: pkg.max_storage_items,
      digital_storage_mb: pkg.digital_storage_mb,
      max_team_members: pkg.max_team_members,
      is_active: pkg.is_active,
      is_featured: pkg.is_featured,
      display_order: pkg.display_order,
      cashback_percentage: Number(pkg.cashback_percentage), // Include cashback
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
      maxScannedPages: pkg.max_scanned_pages,
      retentionDays: pkg.retention_days,
      digitalStorageMb: pkg.digital_storage_mb,
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
      maxScannedPages: pkg.max_scanned_pages,
      retentionDays: pkg.retention_days,
      digitalStorageMb: pkg.digital_storage_mb,
      maxTeamMembers: pkg.max_team_members,
      isActive: pkg.is_active,
      isFeatured: pkg.is_featured,
      displayOrder: pkg.display_order,
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at,
      cashbackPercentage: Number(pkg.cashback_percentage), // Include cashback
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
  not_included: string[];
  intended_for: string | null;
  cashback_percentage: number; // Added cashback here too just in case
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
      not_included: freePlan.not_included || [],
      intended_for: freePlan.intended_for || null,
      cashback_percentage: Number(freePlan.cashback_percentage),
    };
  } catch (error) {
    console.error("Error fetching free plan data:", error);
    return null;
  }
}
