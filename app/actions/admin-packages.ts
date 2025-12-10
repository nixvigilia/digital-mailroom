"use server";

import { prisma } from "@/utils/prisma";
import { verifySession } from "@/utils/supabase/dal";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/app/generated/prisma/enums";
import { logActivity } from "./activity-log";
import { z } from "zod";

// Helper to ensure the user is an admin
async function ensureAdmin() {
  const session = await verifySession();
  const profile = await prisma.profile.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (profile?.role !== UserRole.SYSTEM_ADMIN) {
    throw new Error("Unauthorized: Access restricted to administrators.");
  }
  return session;
}

// Zod Schema for validation
const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  plan_type: z.string().min(1, "Plan Type is required"),
  intended_for: z.string().optional(),
  description: z.string().optional(),
  price_monthly: z.coerce.number().min(0, "Monthly price must be positive"),
  price_quarterly: z.coerce.number().optional().nullable(),
  price_yearly: z.coerce.number().optional().nullable(),
  features: z.array(z.string()),
  not_included: z.array(z.string()),
  max_scanned_pages: z.coerce.number().optional().nullable(),
  retention_days: z.coerce.number().optional().nullable(),
  max_storage_items: z.coerce.number().optional().nullable(),
  digital_storage_mb: z.coerce.number().optional().nullable(),
  max_team_members: z.coerce.number().optional().nullable(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  display_order: z.coerce.number().default(0),
  cashback_percentage: z.coerce.number().min(0).max(100).default(5),
});

export type PackageData = z.infer<typeof packageSchema> & { id: string };

export async function getPackages() {
  try {
    await ensureAdmin();
    const packages = await prisma.package.findMany({
      orderBy: { display_order: "asc" },
    });
    
    // Convert Decimal types to numbers for JSON serialization
    const serializedPackages = packages.map(pkg => ({
      ...pkg,
      price_monthly: Number(pkg.price_monthly),
      price_quarterly: pkg.price_quarterly ? Number(pkg.price_quarterly) : null,
      price_yearly: pkg.price_yearly ? Number(pkg.price_yearly) : null,
      cashback_percentage: Number(pkg.cashback_percentage),
      width: pkg.width ? Number(pkg.width) : null, // Assuming package might have these if reused, but schema says Package model doesn't have dimensions, Mailbox does. Checking schema again.
      // Package model: price_monthly, price_quarterly, price_yearly, cashback_percentage are Decimals.
    }));

    return { success: true, data: serializedPackages };
  } catch (error) {
    console.error("Error fetching packages:", error);
    return { success: false, message: "Failed to fetch packages" };
  }
}

export async function createPackage(data: z.infer<typeof packageSchema>) {
  try {
    const session = await ensureAdmin();
    const validated = packageSchema.parse(data);

    const newPackage = await prisma.package.create({
      data: {
        ...validated,
        created_by: session.userId,
      },
    });
    
    // Serialize Decimal fields
    const serializedPackage = {
      ...newPackage,
      price_monthly: Number(newPackage.price_monthly),
      price_quarterly: newPackage.price_quarterly ? Number(newPackage.price_quarterly) : null,
      price_yearly: newPackage.price_yearly ? Number(newPackage.price_yearly) : null,
      cashback_percentage: Number(newPackage.cashback_percentage),
    };

    await logActivity(session.userId, "CREATE_PACKAGE", {
      package_name: newPackage.name,
      package_id: newPackage.id,
    });

    revalidatePath("/admin/packages");
    return { success: true, message: "Package created successfully", data: serializedPackage };
  } catch (error) {
    console.error("Error creating package:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create package",
    };
  }
}

export async function updatePackage(id: string, data: z.infer<typeof packageSchema>) {
  try {
    const session = await ensureAdmin();
    const validated = packageSchema.parse(data);

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: validated,
    });
    
    // Serialize Decimal fields
    const serializedPackage = {
      ...updatedPackage,
      price_monthly: Number(updatedPackage.price_monthly),
      price_quarterly: updatedPackage.price_quarterly ? Number(updatedPackage.price_quarterly) : null,
      price_yearly: updatedPackage.price_yearly ? Number(updatedPackage.price_yearly) : null,
      cashback_percentage: Number(updatedPackage.cashback_percentage),
    };

    await logActivity(session.userId, "UPDATE_PACKAGE", {
      package_name: updatedPackage.name,
      package_id: updatedPackage.id,
    });

    revalidatePath("/admin/packages");
    return { success: true, message: "Package updated successfully", data: serializedPackage };
  } catch (error) {
    console.error("Error updating package:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update package",
    };
  }
}

export async function deletePackage(id: string) {
  try {
    const session = await ensureAdmin();

    const pkg = await prisma.package.delete({
      where: { id },
    });

    await logActivity(session.userId, "DELETE_PACKAGE", {
      package_name: pkg.name,
      package_id: pkg.id,
    });

    revalidatePath("/admin/packages");
    return { success: true, message: "Package deleted successfully" };
  } catch (error) {
    console.error("Error deleting package:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete package",
    };
  }
}

