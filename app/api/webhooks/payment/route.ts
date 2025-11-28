import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";
import {SubscriptionStatus, PlanType, BillingCycle} from "@/app/generated/prisma";

// Webhook secret from environment variables
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Payment Webhook Handler
 * 
 * Handles payment provider webhooks (Stripe, PayPal, etc.)
 * Updates subscription status based on payment events
 * 
 * Supported Events:
 * - payment_intent.succeeded / payment_intent.payment_failed
 * - customer.subscription.created / updated / deleted
 * - invoice.payment_succeeded / invoice.payment_failed
 * - charge.succeeded / charge.failed
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || 
                      request.headers.get("x-paypal-signature") ||
                      request.headers.get("x-webhook-signature");

    // Verify webhook signature (implement based on your payment provider)
    if (WEBHOOK_SECRET && signature) {
      const isValid = await verifyWebhookSignature(body, signature, WEBHOOK_SECRET);
      if (!isValid) {
        return NextResponse.json(
          {error: "Invalid webhook signature"},
          {status: 401}
        );
      }
    }

    // Parse webhook event
    const event = JSON.parse(body);

    // Handle different event types
    switch (event.type) {
      // Stripe Events
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      // PayPal Events (if using PayPal)
      case "PAYMENT.SALE.COMPLETED":
        await handlePaymentSucceeded(event.resource);
        break;

      case "PAYMENT.SALE.DENIED":
        await handlePaymentFailed(event.resource);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
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

/**
 * Verify webhook signature
 * Implement based on your payment provider (Stripe, PayPal, etc.)
 */
async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // TODO: Implement signature verification based on your payment provider
  // For Stripe: use stripe.webhooks.constructEvent()
  // For PayPal: use crypto.createVerify()
  
  // For now, return true if secret matches (not secure for production)
  // In production, use proper signature verification
  return true;
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(payment: any) {
  try {
    const customerId = payment.customer || payment.payer?.payer_info?.email;
    const amount = payment.amount || payment.amount?.total;
    const currency = payment.currency || payment.amount?.currency;

    // Find subscription by customer ID or payment metadata
    const subscription = await prisma.subscription.findFirst({
      where: {
        payment_method_id: customerId,
        // Or use metadata from payment object
      },
      include: {
        profile: true,
      },
    });

    if (subscription) {
      // Update subscription with payment info
      await prisma.subscription.update({
        where: {id: subscription.id},
        data: {
          status: SubscriptionStatus.ACTIVE,
          last_payment_date: new Date(),
          next_billing_date: calculateNextBillingDate(
            subscription.billing_cycle,
            new Date()
          ),
        },
      });

      console.log(`Payment succeeded for subscription ${subscription.id}`);
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payment: any) {
  try {
    const customerId = payment.customer || payment.payer?.payer_info?.email;

    const subscription = await prisma.subscription.findFirst({
      where: {
        payment_method_id: customerId,
      },
    });

    if (subscription) {
      // Suspend subscription on payment failure
      await prisma.subscription.update({
        where: {id: subscription.id},
        data: {
          status: SubscriptionStatus.SUSPENDED,
        },
      });

      console.log(`Payment failed for subscription ${subscription.id}`);
      
      // TODO: Send notification to user about payment failure
    }
  } catch (error) {
    console.error("Error handling payment failed:", error);
    throw error;
  }
}

/**
 * Handle subscription creation/update
 */
async function handleSubscriptionUpdate(subscriptionData: any) {
  try {
    const customerId = subscriptionData.customer;
    const planId = subscriptionData.items?.data?.[0]?.price?.id;
    const status = subscriptionData.status;
    const currentPeriodEnd = subscriptionData.current_period_end
      ? new Date(subscriptionData.current_period_end * 1000)
      : null;
    const cancelAtPeriodEnd = subscriptionData.cancel_at_period_end;

    // Find or create subscription
    const profile = await prisma.profile.findFirst({
      where: {
        // Match by customer ID stored in payment_method_id or metadata
        // You may need to store Stripe customer ID separately
      },
    });

    if (profile) {
      // Map Stripe status to our SubscriptionStatus
      let subscriptionStatus: SubscriptionStatus;
      if (status === "active") {
        subscriptionStatus = SubscriptionStatus.ACTIVE;
      } else if (status === "canceled" || cancelAtPeriodEnd) {
        subscriptionStatus = SubscriptionStatus.CANCELLED;
      } else if (status === "past_due" || status === "unpaid") {
        subscriptionStatus = SubscriptionStatus.SUSPENDED;
      } else {
        subscriptionStatus = SubscriptionStatus.EXPIRED;
      }

      // Determine plan type from plan ID or metadata
      const planType = mapPlanType(planId || subscriptionData.metadata?.plan);
      const billingCycle = mapBillingCycle(
        subscriptionData.items?.data?.[0]?.price?.recurring?.interval
      );

      await prisma.subscription.upsert({
        where: {
          profile_id: profile.id,
        },
        create: {
          profile_id: profile.id,
          plan_type: planType,
          status: subscriptionStatus,
          billing_cycle: billingCycle,
          payment_method_id: customerId,
          next_billing_date: currentPeriodEnd,
          expires_at: currentPeriodEnd,
        },
        update: {
          plan_type: planType,
          status: subscriptionStatus,
          billing_cycle: billingCycle,
          payment_method_id: customerId,
          next_billing_date: currentPeriodEnd,
          expires_at: currentPeriodEnd,
          cancelled_at: cancelAtPeriodEnd ? currentPeriodEnd : null,
        },
      });

      console.log(`Subscription updated for profile ${profile.id}`);
    }
  } catch (error) {
    console.error("Error handling subscription update:", error);
    throw error;
  }
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscriptionData: any) {
  try {
    const customerId = subscriptionData.customer;

    const subscription = await prisma.subscription.findFirst({
      where: {
        payment_method_id: customerId,
      },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: {id: subscription.id},
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelled_at: new Date(),
        },
      });

      console.log(`Subscription cancelled: ${subscription.id}`);
    }
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
    throw error;
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;
    const amountPaid = invoice.amount_paid;
    const periodEnd = invoice.period_end
      ? new Date(invoice.period_end * 1000)
      : null;

    const subscription = await prisma.subscription.findFirst({
      where: {
        payment_method_id: customerId,
      },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: {id: subscription.id},
        data: {
          status: SubscriptionStatus.ACTIVE,
          last_payment_date: new Date(),
          next_billing_date: periodEnd,
        },
      });

      console.log(`Invoice payment succeeded for subscription ${subscription.id}`);
      
      // TODO: Create invoice record in database if you have an Invoice model
    }
  } catch (error) {
    console.error("Error handling invoice payment succeeded:", error);
    throw error;
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const customerId = invoice.customer;

    const subscription = await prisma.subscription.findFirst({
      where: {
        payment_method_id: customerId,
      },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: {id: subscription.id},
        data: {
          status: SubscriptionStatus.SUSPENDED,
        },
      });

      console.log(`Invoice payment failed for subscription ${subscription.id}`);
      
      // TODO: Send notification to user
    }
  } catch (error) {
    console.error("Error handling invoice payment failed:", error);
    throw error;
  }
}

/**
 * Map payment provider plan to our PlanType enum
 */
function mapPlanType(planId: string | undefined): PlanType {
  if (!planId) return PlanType.BASIC;

  const planLower = planId.toLowerCase();
  if (planLower.includes("basic")) return PlanType.BASIC;
  if (planLower.includes("premium")) return PlanType.PREMIUM;
  if (planLower.includes("business")) return PlanType.BUSINESS;
  if (planLower.includes("enterprise")) return PlanType.ENTERPRISE;

  return PlanType.BASIC;
}

/**
 * Map payment provider billing interval to our BillingCycle enum
 */
function mapBillingCycle(interval: string | undefined): BillingCycle {
  if (!interval) return BillingCycle.MONTHLY;

  const intervalLower = interval.toLowerCase();
  if (intervalLower === "month" || intervalLower === "monthly") {
    return BillingCycle.MONTHLY;
  }
  if (intervalLower === "quarter" || intervalLower === "quarterly") {
    return BillingCycle.QUARTERLY;
  }
  if (intervalLower === "year" || intervalLower === "yearly" || intervalLower === "annual") {
    return BillingCycle.YEARLY;
  }

  return BillingCycle.MONTHLY;
}

/**
 * Calculate next billing date based on billing cycle
 */
function calculateNextBillingDate(
  cycle: BillingCycle,
  fromDate: Date = new Date()
): Date {
  const nextDate = new Date(fromDate);

  switch (cycle) {
    case BillingCycle.MONTHLY:
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case BillingCycle.QUARTERLY:
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case BillingCycle.YEARLY:
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  return nextDate;
}

