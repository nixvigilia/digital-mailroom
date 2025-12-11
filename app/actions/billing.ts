"use server";

import {verifySession} from "@/utils/supabase/dal";
import {prisma} from "@/utils/prisma";
import {PaymentStatus} from "@/app/generated/prisma/enums";

export interface BillingHistoryItem {
  id: string;
  date: Date;
  amount: number;
  status: string;
  description: string | null;
  external_id: string;
  invoice_url: string | null;
  payment_method: string | null;
  payment_channel: string | null;
  paid_at: Date | null;
}

export interface SubscriptionData {
  plan: string;
  status: string;
  billingCycle: string;
  amount: number;
  nextBillingDate: Date | null;
  startDate: Date | null;
}

/**
 * Get billing history for current user
 */
export async function getBillingHistory(): Promise<{
  success: boolean;
  data?: BillingHistoryItem[];
  message?: string;
}> {
  try {
    const session = await verifySession();
    const userId = session.userId;

    const transactions = await prisma.paymentTransaction.findMany({
      where: {
        profile_id: userId,
      },
      select: {
        id: true,
        amount: true,
        status: true,
        description: true,
        external_id: true,
        invoice_url: true,
        payment_method: true,
        payment_channel: true,
        paid_at: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedTransactions: BillingHistoryItem[] = transactions.map(
      (t) => ({
        id: t.id,
        date: (t.paid_at || t.created_at).toISOString(),
        amount: Number(t.amount),
        status: t.status,
        description: t.description,
        external_id: t.external_id,
        invoice_url: t.invoice_url,
        payment_method: t.payment_method,
        payment_channel: t.payment_channel,
        paid_at: t.paid_at ? t.paid_at.toISOString() : null,
      })
    );

    return {
      success: true,
      data: formattedTransactions,
    };
  } catch (error) {
    console.error("Error fetching billing history:", error);
    return {
      success: false,
      message: "Failed to fetch billing history",
    };
  }
}

/**
 * Get current subscription data for user
 */
export async function getCurrentSubscription(): Promise<{
  success: boolean;
  data?: SubscriptionData;
  message?: string;
}> {
  try {
    const session = await verifySession();
    const userId = session.userId;

    const subscription = await prisma.subscription.findFirst({
      where: {
        profile_id: userId,
        status: "ACTIVE",
      },
      include: {
        package: {
          select: {
            name: true,
            price_monthly: true,
            price_quarterly: true,
            price_yearly: true,
          },
        },
      },
      orderBy: {
        started_at: "desc",
      },
    });

    if (!subscription) {
      return {
        success: true,
        data: {
          plan: "Free",
          status: "inactive",
          billingCycle: "monthly",
          amount: 0,
          nextBillingDate: null,
          startDate: null,
        },
      };
    }

    let amount = 0;
    switch (subscription.billing_cycle) {
      case "MONTHLY":
        amount = Number(subscription.package?.price_monthly || 0);
        break;
      case "QUARTERLY":
        amount = Number(subscription.package?.price_quarterly || 0);
        break;
      case "YEARLY":
        amount = Number(subscription.package?.price_yearly || 0);
        break;
    }

    return {
      success: true,
      data: {
        plan: subscription.package?.name || subscription.plan_type,
        status: subscription.status.toLowerCase(),
        billingCycle: subscription.billing_cycle.toLowerCase(),
        amount: amount,
        nextBillingDate: subscription.next_billing_date
          ? new Date(subscription.next_billing_date).toISOString()
          : null,
        startDate: subscription.started_at
          ? new Date(subscription.started_at).toISOString()
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return {
      success: false,
      message: "Failed to fetch subscription data",
    };
  }
}

