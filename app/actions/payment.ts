"use server";

import {createClient} from "@/utils/supabase/server";
import {prisma} from "@/utils/prisma";
import {createCheckoutSession} from "@/lib/paymongo";
import {createInvoice} from "@/lib/xendit";

// Payment gateway selection - default to PayMongo
// Set PAYMENT_GATEWAY=xendit to use Xendit instead
const PAYMENT_GATEWAY = (
  process.env.PAYMENT_GATEWAY || "paymongo"
).toLowerCase();

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

    // Get user's name from basic info (KYC) if available
    const kycData = await prisma.kYCVerification.findUnique({
      where: {profile_id: profile.id},
      select: {first_name: true, last_name: true, phone_number: true},
    });

    // Normalize phone number: remove leading 0 if present
    const normalizePhoneNumber = (
      phone: string | null | undefined
    ): string | undefined => {
      if (!phone || phone === "Not provided") return undefined;
      return phone.startsWith("0") ? phone.substring(1) : phone;
    };

    const normalizedPhone = normalizePhoneNumber(kycData?.phone_number);

    let invoiceUrl: string;
    let paymentChannel: string;

    // Use PayMongo as default, Xendit as fallback (hidden for now)
    if (PAYMENT_GATEWAY === "xendit") {
      // Xendit integration (kept for future use)
      const invoice = await createInvoice({
        external_id: externalId,
        amount: amount,
        payer_email: user.email,
        description: description,
        should_send_email: true,
        success_redirect_url: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/app`,
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
        customer:
          kycData && normalizedPhone
            ? {
                given_names: kycData.first_name,
                surname: kycData.last_name,
                email: user.email,
                mobile_number: normalizedPhone,
              }
            : undefined,
      });
      invoiceUrl = invoice.invoice_url;
      paymentChannel = "XENDIT_INVOICE";
    } else {
      // PayMongo integration (default)
      const checkoutSession = await createCheckoutSession({
        external_id: externalId,
        amount: amount,
        payer_email: user.email,
        description: description,
        success_url: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/app`,
        failure_url: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/app/pricing?error=true`,
        line_items: [
          {
            name: `${pkg.name} Plan (${billingCycle})`,
            quantity: 1,
            amount: amount,
            currency: "PHP",
          },
        ],
        billing:
          kycData && normalizedPhone
            ? {
                name: `${kycData.first_name} ${kycData.last_name}`,
                email: user.email,
                phone: normalizedPhone,
              }
            : {
                email: user.email,
              },
      });
      invoiceUrl = checkoutSession.attributes.checkout_url;
      paymentChannel = "PAYMONGO_CHECKOUT";
    }

    // Create Payment Transaction History
    // @ts-ignore - Prisma client might be stale in editor
    await prisma.paymentTransaction.create({
      data: {
        profile_id: profile.id,
        amount: amount,
        currency: "PHP",
        status: "PENDING", // Using string literal
        external_id: externalId,
        invoice_url: invoiceUrl,
        description: description,
        payment_channel: paymentChannel,
        metadata: mailingLocationId
          ? {mailing_location_id: mailingLocationId}
          : undefined,
      },
    });

    return {success: true, invoiceUrl};
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
