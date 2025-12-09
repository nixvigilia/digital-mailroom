"use server";

import {createClient} from "@/utils/supabase/server";
import {prisma} from "@/utils/prisma";
import {createInvoice} from "@/lib/xendit";

export type PaymentResult =
  | {success: true; invoiceUrl: string}
  | {success: false; message: string};

export async function createSubscriptionInvoice(
  planType: string,
  billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY",
  mailingLocationId?: string
): Promise<PaymentResult> {
  try {
    const supabase = await createClient();
    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return {success: false, message: "User not authenticated"};
    }

    // Validate mailing location if provided
    if (mailingLocationId) {
      const location = await prisma.mailingLocation.findUnique({
        where: {id: mailingLocationId, is_active: true},
      });
      if (!location) {
        return {
          success: false,
          message: "Invalid or inactive mailing location",
        };
      }
    }

    const profile = await prisma.profile.findUnique({
      where: {email: user.email},
    });

    if (!profile) {
      return {success: false, message: "Profile not found"};
    }

    const pkg = await prisma.package.findUnique({
      where: {plan_type: planType},
    });

    if (!pkg) {
      return {success: false, message: "Package not found"};
    }

    let amount = 0;
    let description = `Subscription for ${pkg.name} (${billingCycle})`;

    switch (billingCycle) {
      case "MONTHLY":
        amount = Number(pkg.price_monthly);
        break;
      case "QUARTERLY":
        amount = pkg.price_quarterly
          ? Number(pkg.price_quarterly)
          : Number(pkg.price_monthly) * 3;
        break;
      case "YEARLY":
        amount = pkg.price_yearly
          ? Number(pkg.price_yearly)
          : Number(pkg.price_monthly) * 12;
        break;
    }

    const externalId = `INV_${
      profile.id
    }_${planType}_${billingCycle}_${Date.now()}`;

    // Create invoice in Xendit
    const invoice = await createInvoice({
      external_id: externalId,
      amount: amount,
      payer_email: user.email,
      description: description,
      should_send_email: true,
      success_redirect_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/app/billing?success=true`,
      failure_redirect_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/app/pricing?error=true`,
      items: [
        {
          name: `${pkg.name} Plan (${billingCycle})`,
          quantity: 1,
          price: amount,
          category: "Subscription",
        },
      ],
    });

    // Create Payment Transaction History
    // @ts-ignore - Prisma client might be stale in editor
    await prisma.paymentTransaction.create({
      data: {
        profile_id: profile.id,
        amount: amount,
        currency: "PHP",
        status: "PENDING", // Using string literal
        external_id: externalId,
        invoice_url: invoice.invoice_url,
        description: description,
        payment_channel: "XENDIT_INVOICE",
        metadata: mailingLocationId
          ? {mailing_location_id: mailingLocationId}
          : undefined,
      },
    });

    return {success: true, invoiceUrl: invoice.invoice_url};
  } catch (error) {
    console.error("Error creating subscription invoice:", error);
    return {success: false, message: "Failed to create invoice"};
  }
}

export async function getPublicMailingLocations() {
  try {
    const locations = await prisma.mailingLocation.findMany({
      where: {is_active: true},
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        province: true,
      },
      orderBy: {name: "asc"},
    });
    return {success: true, data: locations};
  } catch (error) {
    console.error("Error fetching locations:", error);
    return {success: false, error: "Failed to fetch locations"};
  }
}
