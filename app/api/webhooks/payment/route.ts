import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";
import {
  SubscriptionStatus,
  PlanType,
  BillingCycle,
} from "@/app/generated/prisma/enums";
import {verifyWebhookSignature} from "@/lib/paymongo";
import {verifyCallbackToken} from "@/lib/xendit";
import {logActivity} from "@/app/actions/activity-log";

// Webhook secrets from environment variables
// PayMongo uses a separate webhook secret (not the API secret key)
// Get this from PayMongo Dashboard > Webhooks > Your Webhook > Webhook Secret
const PAYMONGO_WEBHOOK_SECRET =
  process.env.PAYMONGO_WEBHOOK_SECRET || process.env.PAYMONGO_SECRET_KEY;
const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const rawBody = await request.text();

    // Detect which payment gateway the webhook is from
    // PayMongo signature header might be case-sensitive: "Paymongo-Signature" or "paymongo-signature"
    const paymongoSignatureHeader =
      request.headers.get("paymongo-signature") ||
      request.headers.get("Paymongo-Signature");
    const isPayMongo =
      userAgent.includes("PayMongo") || paymongoSignatureHeader;
    const isXendit =
      userAgent.includes("xendit") || request.headers.get("x-callback-token");

    if (isPayMongo) {
      // Handle PayMongo webhook
      console.log("Received request from PayMongo");
      const signature = paymongoSignatureHeader;

      console.log("Webhook details:", {
        hasSignature: !!signature,
        signatureLength: signature?.length,
        payloadLength: rawBody.length,
        hasWebhookSecret: !!PAYMONGO_WEBHOOK_SECRET,
        webhookSecretLength: PAYMONGO_WEBHOOK_SECRET?.length,
      });

      // Verify webhook signature using PayMongo webhook secret
      if (PAYMONGO_WEBHOOK_SECRET) {
        if (
          !verifyWebhookSignature(signature, rawBody, PAYMONGO_WEBHOOK_SECRET)
        ) {
          console.error("Invalid PayMongo webhook signature");
          console.error("Signature header:", signature);
          console.error("Payload length:", rawBody.length);
          console.error("Payload preview:", rawBody.substring(0, 200));

          // Important: Make sure you're using the webhook secret from PayMongo Dashboard
          // NOT the API secret key! Get it from: Dashboard > Webhooks > Your Webhook > Webhook Secret
          console.error(
            "NOTE: Make sure PAYMONGO_WEBHOOK_SECRET is the webhook secret from PayMongo Dashboard, not the API secret key!"
          );

          return NextResponse.json(
            {error: "Invalid webhook signature"},
            {status: 403}
          );
        }
      } else {
        console.warn(
          "PAYMONGO_WEBHOOK_SECRET is not set. Skipping signature verification."
        );
      }

      const event = JSON.parse(rawBody);
      console.log("Received PayMongo Webhook:", JSON.stringify(event, null, 2));

      // PayMongo webhook structure: { data: { type: "event", id, attributes: { type: "checkout_session.payment.paid", ... } } }
      const eventData = event.data;
      const eventType = eventData?.attributes?.type; // The actual event type is in attributes.type

      console.log("PayMongo event type:", eventType);

      // Handle checkout session payment events
      // PayMongo uses "checkout_session.payment.paid" for successful payments
      if (
        eventType === "checkout_session.payment.succeeded" ||
        eventType === "checkout_session.payment.paid"
      ) {
        await handleCheckoutPaymentSucceeded(eventData);
      } else if (eventType === "checkout_session.payment.failed") {
        await handleCheckoutPaymentFailed(eventData);
      } else if (eventType === "checkout_session.expired") {
        await handleCheckoutExpired(eventData);
      } else {
        console.log("Unhandled PayMongo event type:", eventType);
      }
    } else if (isXendit) {
      // Handle Xendit webhook (kept for future use)
      console.log("Received request from Xendit");
    const callbackToken = request.headers.get("x-callback-token");

    // Verify webhook signature/token
    if (XENDIT_CALLBACK_TOKEN) {
      if (!verifyCallbackToken(callbackToken, XENDIT_CALLBACK_TOKEN)) {
        console.error("Invalid Xendit callback token");
        return NextResponse.json(
          {error: "Invalid callback token"},
          {status: 403}
        );
      }
    } else {
      console.warn(
          "XENDIT_CALLBACK_TOKEN is not set. Skipping token verification."
      );
    }

      const event = JSON.parse(rawBody);
    console.log("Received Xendit Webhook:", JSON.stringify(event, null, 2));

      // Handle Xendit invoice events
    if (event.status === "PAID" || event.status === "SETTLED") {
        await handleXenditInvoicePaid(event);
    } else if (event.status === "EXPIRED") {
        await handleXenditInvoiceExpired(event);
      } else {
        console.log("Unhandled Xendit event status:", event.status);
      }
    } else {
      console.warn("Unknown webhook source");
      return NextResponse.json(
        {error: "Unknown webhook source"},
        {status: 400}
      );
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

async function handleCheckoutExpired(eventData: any) {
  try {
    const checkoutSession = eventData.attributes;
    const referenceNumber = checkoutSession.reference_number;
    if (!referenceNumber) return;

    // @ts-ignore
    const transaction = await prisma.paymentTransaction.findUnique({
      where: {external_id: referenceNumber},
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
      console.log(`Payment transaction marked as EXPIRED: ${referenceNumber}`);

      // Log payment expiration
      await logActivity(
        transaction.profile_id,
        "PAYMENT_EXPIRED",
        {
          transaction_id: transaction.id,
          amount: Number(transaction.amount),
          currency: transaction.currency,
          reference_number: referenceNumber,
          payment_channel: transaction.payment_channel || "PAYMONGO_CHECKOUT",
        },
        "PaymentTransaction",
        transaction.id
      );
    } else {
      console.log(
        `Expired checkout session not found in transactions: ${referenceNumber}`
      );
    }
  } catch (error) {
    console.error("Error handling checkout expired:", error);
  }
}

async function handleCheckoutPaymentFailed(eventData: any) {
  try {
    const checkoutSession = eventData.attributes;
    const referenceNumber = checkoutSession.reference_number;
    if (!referenceNumber) return;

    // @ts-ignore
    const transaction = await prisma.paymentTransaction.findUnique({
      where: {external_id: referenceNumber},
    });

    if (transaction) {
      // @ts-ignore
      await prisma.paymentTransaction.update({
        where: {id: transaction.id},
        data: {
          status: "FAILED",
        },
      });
      console.log(`Payment transaction marked as FAILED: ${referenceNumber}`);

      // Log payment failure
      await logActivity(
        transaction.profile_id,
        "PAYMENT_FAILED",
        {
          transaction_id: transaction.id,
          amount: Number(transaction.amount),
          currency: transaction.currency,
          reference_number: referenceNumber,
          payment_channel: transaction.payment_channel || "PAYMONGO_CHECKOUT",
        },
        "PaymentTransaction",
        transaction.id
      );
    }
  } catch (error) {
    console.error("Error handling checkout payment failed:", error);
  }
}

async function handleCheckoutPaymentSucceeded(eventData: any) {
  try {
    // PayMongo event data structure: { type, id, attributes: { data: { attributes: { checkout_session_data } } } }
    // The checkout session is nested in attributes.data.attributes
    const checkoutSession =
      eventData.attributes?.data?.attributes || eventData.attributes;
    const referenceNumber = checkoutSession.reference_number;

    // Amount can be in line_items or directly in attributes
    // Get amount from first line item or from payment_intent
    let amount = 0;
    if (checkoutSession.line_items && checkoutSession.line_items.length > 0) {
      amount = checkoutSession.line_items[0].amount / 100; // Convert from cents to PHP
    } else if (checkoutSession.payment_intent?.attributes?.amount) {
      amount = checkoutSession.payment_intent.attributes.amount / 100;
    } else if (checkoutSession.amount) {
      amount = checkoutSession.amount / 100;
    }

    const paymentIntent = checkoutSession.payment_intent;
    const paymentIntentId =
      paymentIntent?.id ||
      paymentIntent?.data?.id ||
      paymentIntent?.attributes?.id;

    // Parse reference_number: INV_${profile.id}_${planType}_${billingCycle}_${timestamp}
    if (!referenceNumber || !referenceNumber.startsWith("INV_")) {
      console.warn("Invalid reference_number format:", referenceNumber);
      return;
    }

    const parts = referenceNumber.split("_");
    // parts[0] = "INV"
    // parts[1] = profileId
    // parts[2] = planType
    // parts[3] = billingCycle
    // parts[4] = timestamp

    if (parts.length < 5) {
      console.error("Invalid reference_number structure:", referenceNumber);
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
        "Invalid plan type or billing cycle in reference_number:",
        referenceNumber
      );
      return;
    }

    // Update PaymentTransaction to PAID
    // @ts-ignore
    let transaction = await prisma.paymentTransaction.findUnique({
      where: {external_id: referenceNumber},
    });

    if (transaction) {
      // @ts-ignore
      transaction = await prisma.paymentTransaction.update({
        where: {id: transaction.id},
        data: {
          status: "PAID",
          paid_at: new Date(),
          payment_method:
            checkoutSession.payment_method_used ||
            paymentIntent?.attributes?.payment_method ||
            paymentIntent?.data?.attributes?.payment_method ||
            "card",
        },
      });

      // Log payment received
      await logActivity(
        profileId,
        "PAYMENT_RECEIVED",
        {
          transaction_id: transaction.id,
          amount: amount,
          currency: "PHP",
          payment_method:
            checkoutSession.payment_method_used ||
            paymentIntent?.attributes?.payment_method ||
            "card",
          payment_channel: "PAYMONGO_CHECKOUT",
          reference_number: referenceNumber,
        },
        "PaymentTransaction",
        transaction.id
      );
    } else {
      // Fallback: Create transaction if it doesn't exist
      console.warn(
        `Transaction not found for ${referenceNumber}, creating new record.`
      );
      // @ts-ignore
      transaction = await prisma.paymentTransaction.create({
        data: {
          profile_id: profileId,
          amount: amount,
          currency: "PHP",
          status: "PAID",
          external_id: referenceNumber,
          invoice_url: checkoutSession.checkout_url,
          description: `Subscription for ${planType} (${billingCycle})`,
          paid_at: new Date(),
          payment_method:
            checkoutSession.payment_method_used ||
            paymentIntent?.attributes?.payment_method ||
            paymentIntent?.data?.attributes?.payment_method ||
            "card",
          payment_channel: "PAYMONGO_CHECKOUT",
        },
      });

      // Log payment received
      await logActivity(
        profileId,
        "PAYMENT_RECEIVED",
        {
          transaction_id: transaction.id,
          amount: amount,
          currency: "PHP",
          payment_method:
            checkoutSession.payment_method_used ||
            paymentIntent?.attributes?.payment_method ||
            "card",
          payment_channel: "PAYMONGO_CHECKOUT",
          reference_number: referenceNumber,
        },
        "PaymentTransaction",
        transaction.id
      );
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

        // Log mailbox assignment
        await logActivity(
          profileId,
          "MAILBOX_ASSIGNED",
          {
            mailbox_id: mailboxId,
            mailing_location_id: mailingLocationId,
            plan_type: planType,
          },
          "Mailbox",
          mailboxId
        );
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
          payment_method_id: "PAYMONGO_CHECKOUT",
          package_id: pkg?.id,
          mailing_location_id:
            mailingLocationId || existingSub.mailing_location_id,
          mailbox_id: mailboxId || existingSub.mailbox_id,
        },
      });
      subscriptionId = updatedSub.id;

      // Log subscription update/renewal
      await logActivity(
        profileId,
        existingSub.status === SubscriptionStatus.ACTIVE
          ? "SUBSCRIPTION_RENEWED"
          : "SUBSCRIPTION_UPDATED",
        {
          subscription_id: subscriptionId,
          plan_type: planType,
          billing_cycle: billingCycle,
          amount: amount,
          next_billing_date: nextBillingDate.toISOString(),
          expires_at: expiresAt.toISOString(),
          previous_status: existingSub.status,
        },
        "Subscription",
        subscriptionId
      );
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
          payment_method_id: "PAYMONGO_CHECKOUT",
          package_id: pkg?.id,
          mailing_location_id: mailingLocationId,
          mailbox_id: mailboxId,
        },
      });
      subscriptionId = newSub.id;

      // Log subscription creation
      await logActivity(
        profileId,
        "SUBSCRIPTION_CREATED",
        {
          subscription_id: subscriptionId,
          plan_type: planType,
          billing_cycle: billingCycle,
          amount: amount,
          next_billing_date: nextBillingDate.toISOString(),
          expires_at: expiresAt.toISOString(),
          mailing_location_id: mailingLocationId,
          mailbox_id: mailboxId,
        },
        "Subscription",
        subscriptionId
      );
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
    // We pass the PayMongo Payment Intent ID as the transaction identifier
    await handleReferralCommission(
      profileId,
      amount,
      pkg,
      paymentIntentId || referenceNumber
    );

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
    let referral = await prisma.referral.findUnique({
      where: {referred_id: profileId},
    });

    // If referral record doesn't exist, try to create it from profile.referred_by
    if (!referral) {
      const profile = await prisma.profile.findUnique({
        where: {id: profileId},
        select: {
          referred_by: true,
        },
      });

      if (profile?.referred_by) {
        // Get referrer's profile to get their referral code
        const referrer = await prisma.profile.findUnique({
          where: {id: profile.referred_by},
          select: {
            id: true,
            referral_code: true,
          },
        });

        if (referrer?.referral_code) {
          // Create referral record
          try {
            referral = await prisma.referral.create({
              data: {
                referrer_id: referrer.id,
                referred_id: profileId,
                referral_code: referrer.referral_code,
              },
            });
            console.log(
              `Created missing referral record for referred user ${profileId}`
            );
          } catch (createError) {
            console.error(
              "Error creating referral record in handleReferralCommission:",
              createError
            );
            // If creation fails (e.g., duplicate), try to fetch again
            referral = await prisma.referral.findUnique({
              where: {referred_id: profileId},
            });
          }
        } else {
          console.log(
            `Referrer ${profile.referred_by} does not have a referral code yet. Skipping commission.`
          );
          return;
        }
      } else {
        console.log(`User ${profileId} was not referred. Skipping commission.`);
        return;
      }
    }

    if (referral) {
      console.log(
        `Processing referral commission for referrer ${referral.referrer_id}, referred user ${profileId}, amount: ${amount}`
      );

      // Default to 5% if package or cashback_percentage is missing
      const cashbackPercentage = pkg?.cashback_percentage
        ? Number(pkg.cashback_percentage)
        : 5;

      // Calculate commission
      const commission = amount * (cashbackPercentage / 100);

      console.log(
        `Calculated commission: ${commission} (${cashbackPercentage}% of ${amount})`
      );

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
      // Status is "pending" initially - will be marked as "paid" after a grace period
      // or when the subscription is confirmed active (e.g., after 30 days)
      const referralTransaction = await prisma.referralTransaction.create({
        data: {
          referral_id: referral.id,
          amount: commission,
          currency: "PHP", // Or retrieve from invoice if dynamic
          status: "pending", // Start as pending, will be marked paid after verification period
          invoice_id: invoiceId,
          description: `Commission for ${
            pkg?.name || "Subscription"
          } (${cashbackPercentage}%)`,
        },
      });

      // Update subscription_plan if needed
      if (pkg?.plan_type && pkg.plan_type !== referral.subscription_plan) {
      await prisma.referral.update({
        where: {id: referral.id},
        data: {
            subscription_plan: pkg.plan_type,
        },
      });
      }

      console.log(
        `Created referral transaction for referrer ${referral.referrer_id}: +${commission}.`
      );

      // Log referral commission for the referrer
      await logActivity(
        referral.referrer_id,
        "REFERRAL_COMMISSION",
        {
          referral_id: referral.id,
          referred_user_id: profileId,
          commission_amount: commission,
          currency: "PHP",
          original_amount: amount,
          cashback_percentage: cashbackPercentage,
          invoice_id: invoiceId,
          plan_type: pkg?.plan_type,
        },
        "ReferralTransaction",
        referralTransaction.id
      );
    }
  } catch (error) {
    console.error("Error handling referral commission:", error);
    // Don't throw error here to prevent blocking the main subscription flow
  }
}

// Xendit webhook handlers (kept for future use)
async function handleXenditInvoiceExpired(invoice: any) {
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

      // Log payment expiration
      await logActivity(
        transaction.profile_id,
        "PAYMENT_EXPIRED",
        {
          transaction_id: transaction.id,
          amount: Number(transaction.amount),
          currency: transaction.currency,
          reference_number: external_id,
          payment_channel: transaction.payment_channel || "XENDIT_INVOICE",
        },
        "PaymentTransaction",
        transaction.id
      );
    } else {
      console.log(`Expired invoice not found in transactions: ${external_id}`);
    }
  } catch (error) {
    console.error("Error handling Xendit invoice expired:", error);
  }
}

async function handleXenditInvoicePaid(invoice: any) {
  try {
    const {external_id, amount, payer_email, payment_method, id} = invoice;

    // Parse external_id: INV_${profile.id}_${planType}_${billingCycle}_${timestamp}
    if (!external_id || !external_id.startsWith("INV_")) {
      console.warn("Invalid external_id format:", external_id);
      return;
    }

    const parts = external_id.split("_");
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
        },
      });

      // Log payment received
      await logActivity(
        profileId,
        "PAYMENT_RECEIVED",
        {
          transaction_id: transaction.id,
          amount: amount,
          currency: "PHP",
          payment_method: payment_method,
          payment_channel: "XENDIT_INVOICE",
          reference_number: external_id,
        },
        "PaymentTransaction",
        transaction.id
      );
    } else {
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
          invoice_url: invoice.invoice_url,
          description: `Subscription for ${planType} (${billingCycle})`,
          paid_at: new Date(),
          payment_method: payment_method,
          payment_channel: "XENDIT_INVOICE",
        },
      });

      // Log payment received
      await logActivity(
        profileId,
        "PAYMENT_RECEIVED",
        {
          transaction_id: transaction.id,
          amount: amount,
          currency: "PHP",
          payment_method: payment_method,
          payment_channel: "XENDIT_INVOICE",
          reference_number: external_id,
        },
        "PaymentTransaction",
        transaction.id
      );
    }

    // Calculate next billing date
    const nextBillingDate = calculateNextBillingDate(billingCycle);
    const expiresAt = nextBillingDate;

    // Get Package details
    const pkg = await prisma.package.findUnique({where: {plan_type: planType}});

    // Get mailing location from transaction metadata
    const mailingLocationId = (transaction?.metadata as any)
      ?.mailing_location_id;
    let mailboxId = null;

    if (mailingLocationId) {
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
        await prisma.mailbox.update({
          where: {id: mailboxId},
          data: {is_occupied: true},
        });

        // Log mailbox assignment
        await logActivity(
          profileId,
          "MAILBOX_ASSIGNED",
          {
            mailbox_id: mailboxId,
            mailing_location_id: mailingLocationId,
            plan_type: planType,
          },
          "Mailbox",
          mailboxId
        );
      }
    }

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

      // Log subscription update/renewal
      await logActivity(
        profileId,
        existingSub.status === SubscriptionStatus.ACTIVE
          ? "SUBSCRIPTION_RENEWED"
          : "SUBSCRIPTION_UPDATED",
        {
          subscription_id: subscriptionId,
          plan_type: planType,
          billing_cycle: billingCycle,
          amount: amount,
          next_billing_date: nextBillingDate.toISOString(),
          expires_at: expiresAt.toISOString(),
          previous_status: existingSub.status,
        },
        "Subscription",
        subscriptionId
      );
    } else {
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

      // Log subscription creation
      await logActivity(
        profileId,
        "SUBSCRIPTION_CREATED",
        {
          subscription_id: subscriptionId,
          plan_type: planType,
          billing_cycle: billingCycle,
          amount: amount,
          next_billing_date: nextBillingDate.toISOString(),
          expires_at: expiresAt.toISOString(),
          mailing_location_id: mailingLocationId,
          mailbox_id: mailboxId,
        },
        "Subscription",
        subscriptionId
      );
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
    await handleReferralCommission(profileId, amount, pkg, id);

    console.log(
      `Successfully processed Xendit payment for profile ${profileId}`
    );
  } catch (error) {
    console.error("Error handling Xendit invoice paid:", error);
    throw error;
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
