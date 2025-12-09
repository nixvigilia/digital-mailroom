import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";
import {
  SubscriptionStatus,
  PlanType,
  BillingCycle,
} from "@/app/generated/prisma/enums";
import {verifyCallbackToken} from "@/lib/xendit";

// Webhook secret from environment variables
const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN;

export async function POST(request: NextRequest) {
  // Check if the request is coming from Xendit (optional, but good for debugging)
  if (request.headers.get("user-agent")?.includes("xendit")) {
    console.log("Received request from Xendit");
  }

  try {
    // Get raw body for signature verification (if needed) or just json
    // Xendit sends JSON body
    const event = await request.json();
    const callbackToken = request.headers.get("x-callback-token");

    // Verify webhook signature/token
    if (XENDIT_CALLBACK_TOKEN) {
      if (!verifyCallbackToken(callbackToken, XENDIT_CALLBACK_TOKEN)) {
        console.error("Invalid Xendit callback token");
        // Return 403 Forbidden instead of 401 for invalid token
        return NextResponse.json(
          {error: "Invalid callback token"},
          {status: 403}
        );
      }
    } else {
      console.warn(
        "XENDIT_CALLBACK_TOKEN is not set in environment variables. Skipping token verification."
      );
    }

    console.log("Received Xendit Webhook:", JSON.stringify(event, null, 2));

    // Check if it's an Invoice Callback
    // Invoice callbacks have `status` and `external_id`.
    if (event.status === "PAID" || event.status === "SETTLED") {
      await handleInvoicePaid(event);
    } else if (event.status === "EXPIRED") {
      await handleInvoiceExpired(event);
    } else {
      console.log("Unhandled event status:", event.status);
    }

    return NextResponse.json({received: true}, {status: 200});
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {error: "Webhook processing failed"},
      {status: 500}
    );
  }
}

async function handleInvoiceExpired(invoice: any) {
  try {
    const {external_id} = invoice;
    if (!external_id) return;

    // @ts-ignore
    const transaction = await prisma.paymentTransaction.findUnique({
      where: {external_id},
    });

    if (transaction) {
      // @ts-ignore
      await prisma.paymentTransaction.update({
        where: {id: transaction.id},
        data: {
          status: "EXPIRED",
          expired_at: new Date(),
        },
      });
      console.log(`Payment transaction marked as EXPIRED: ${external_id}`);
    } else {
      console.log(`Expired invoice not found in transactions: ${external_id}`);
    }
  } catch (error) {
    console.error("Error handling invoice expired:", error);
  }
}

async function handleInvoicePaid(invoice: any) {
  try {
    const {external_id, amount, payer_email, payment_method, id} = invoice;

    // Parse external_id: INV_${profile.id}_${planType}_${billingCycle}_${timestamp}
    if (!external_id || !external_id.startsWith("INV_")) {
      console.warn("Invalid external_id format:", external_id);
      return;
    }

    const parts = external_id.split("_");
    // parts[0] = "INV"
    // parts[1] = profileId
    // parts[2] = planType
    // parts[3] = billingCycle
    // parts[4] = timestamp

    if (parts.length < 5) {
      console.error("Invalid external_id structure:", external_id);
      return;
    }

    const profileId = parts[1];
    const planTypeStr = parts[2];
    const billingCycleStr = parts[3];

    // Validate enums
    const planType = Object.values(PlanType).includes(planTypeStr as PlanType)
      ? (planTypeStr as PlanType)
      : null;

    const billingCycle = Object.values(BillingCycle).includes(
      billingCycleStr as BillingCycle
    )
      ? (billingCycleStr as BillingCycle)
      : null;

    if (!planType || !billingCycle) {
      console.error(
        "Invalid plan type or billing cycle in external_id:",
        external_id
      );
      return;
    }

    // Update PaymentTransaction to PAID
    // @ts-ignore
    let transaction = await prisma.paymentTransaction.findUnique({
      where: {external_id},
    });

    if (transaction) {
      // @ts-ignore
      transaction = await prisma.paymentTransaction.update({
        where: {id: transaction.id},
        data: {
          status: "PAID",
          paid_at: new Date(),
          payment_method: payment_method,
          // payment_channel can be added if available in webhook payload
        },
      });
    } else {
      // Fallback: Create transaction if it doesn't exist (e.g., created before this feature)
      console.warn(
        `Transaction not found for ${external_id}, creating new record.`
      );
      // @ts-ignore
      transaction = await prisma.paymentTransaction.create({
        data: {
          profile_id: profileId,
          amount: amount,
          currency: "PHP",
          status: "PAID",
          external_id: external_id,
          invoice_url: invoice.invoice_url, // Might not be in paid webhook payload sometimes, check Xendit docs
          description: `Subscription for ${planType} (${billingCycle})`,
          paid_at: new Date(),
          payment_method: payment_method,
          payment_channel: "XENDIT_INVOICE",
        },
      });
    }

    // Calculate next billing date
    const nextBillingDate = calculateNextBillingDate(billingCycle);
    const expiresAt = nextBillingDate;

    console.log(
      `Processing subscription for Profile: ${profileId}, Plan: ${planType}, Cycle: ${billingCycle}`
    );

    // Get Package details first
    const pkg = await prisma.package.findUnique({where: {plan_type: planType}});

    // Get mailing location from transaction metadata
    const mailingLocationId = (transaction?.metadata as any)
      ?.mailing_location_id;
    let mailboxId = null;

    // If location selected, try to assign a mailbox
    if (mailingLocationId) {
      // Logic: Find a cluster in this location, then an available mailbox
      // Prefer STANDARD boxes for now, or match plan type if we had logic for that
      // For MVP, just find ANY available mailbox in the location

      const availableMailbox = await prisma.mailbox.findFirst({
        where: {
          cluster: {
            mailing_location_id: mailingLocationId,
          },
          is_occupied: false,
        },
        select: {id: true},
      });

      if (availableMailbox) {
        mailboxId = availableMailbox.id;
        // Mark occupied
        await prisma.mailbox.update({
          where: {id: mailboxId},
          data: {is_occupied: true},
        });
      }
    }

    // Improved Logic:
    // Check for existing active subscription
    const existingSub = await prisma.subscription.findFirst({
      where: {
        profile_id: profileId,
        status: {
          in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.SUSPENDED,
            SubscriptionStatus.EXPIRED,
          ],
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    let subscriptionId;

    if (existingSub) {
      // Update existing
      const updatedSub = await prisma.subscription.update({
        where: {id: existingSub.id},
        data: {
          plan_type: planType,
          billing_cycle: billingCycle,
          status: SubscriptionStatus.ACTIVE,
          last_payment_date: new Date(),
          next_billing_date: nextBillingDate,
          expires_at: expiresAt,
          payment_method_id: "XENDIT_INVOICE",
          package_id: pkg?.id,
          mailing_location_id:
            mailingLocationId || existingSub.mailing_location_id,
          mailbox_id: mailboxId || existingSub.mailbox_id,
        },
      });
      subscriptionId = updatedSub.id;
    } else {
      // Create new
      const newSub = await prisma.subscription.create({
        data: {
          profile_id: profileId,
          plan_type: planType,
          billing_cycle: billingCycle,
          status: SubscriptionStatus.ACTIVE,
          started_at: new Date(),
          last_payment_date: new Date(),
          next_billing_date: nextBillingDate,
          expires_at: expiresAt,
          payment_method_id: "XENDIT_INVOICE",
          package_id: pkg?.id,
          mailing_location_id: mailingLocationId,
          mailbox_id: mailboxId,
        },
      });
      subscriptionId = newSub.id;
    }

    // Link Subscription to Transaction
    if (transaction && subscriptionId) {
      // @ts-ignore
      await prisma.paymentTransaction.update({
        where: {id: transaction.id},
        data: {subscription_id: subscriptionId},
      });
    }

    // Handle Referral Commission
    // We pass the Xendit Invoice ID (id) as the transaction identifier
    await handleReferralCommission(profileId, amount, pkg, id);

    console.log(`Successfully processed payment for profile ${profileId}`);
  } catch (error) {
    console.error("Error handling invoice paid:", error);
    throw error;
  }
}

async function handleReferralCommission(
  profileId: string,
  amount: number,
  pkg: any,
  invoiceId: string
) {
  try {
    const referral = await prisma.referral.findUnique({
      where: {referred_id: profileId},
    });

    if (referral) {
      // Default to 5% if package or cashback_percentage is missing
      const cashbackPercentage = pkg?.cashback_percentage
        ? Number(pkg.cashback_percentage)
        : 5;

      // Calculate commission
      const commission = amount * (cashbackPercentage / 100);

      // Check if this transaction has already been processed
      const existingTransaction = await prisma.referralTransaction.findFirst({
        where: {
          referral_id: referral.id,
          invoice_id: invoiceId,
        },
      });

      if (existingTransaction) {
        console.log(
          `Referral transaction for invoice ${invoiceId} already processed.`
        );
        return;
      }

      // Create Referral Transaction History
      await prisma.referralTransaction.create({
        data: {
          referral_id: referral.id,
          amount: commission,
          currency: "PHP", // Or retrieve from invoice if dynamic
          status: "paid",
          invoice_id: invoiceId,
          description: `Commission for ${
            pkg?.name || "Subscription"
          } (${cashbackPercentage}%)`,
        },
      });

      // Only update status and subscription_plan
      await prisma.referral.update({
        where: {id: referral.id},
        data: {
          status: "active", // Ensure status is active
          subscription_plan: pkg?.plan_type || referral.subscription_plan,
        },
      });

      console.log(
        `Created referral transaction for referrer ${referral.referrer_id}: +${commission}.`
      );
    }
  } catch (error) {
    console.error("Error handling referral commission:", error);
    // Don't throw error here to prevent blocking the main subscription flow
  }
}

function calculateNextBillingDate(cycle: BillingCycle): Date {
  const date = new Date();
  switch (cycle) {
    case BillingCycle.MONTHLY:
      date.setMonth(date.getMonth() + 1);
      break;
    case BillingCycle.QUARTERLY:
      date.setMonth(date.getMonth() + 3);
      break;
    case BillingCycle.YEARLY:
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}
