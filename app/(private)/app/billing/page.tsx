import {getBillingHistory, getCurrentSubscription} from "@/app/actions/billing";
import {BillingPageClient} from "./BillingPageClient";

interface BillingPageProps {
  searchParams: Promise<{error?: string; success?: string}>;
}

export default async function BillingPage({searchParams}: BillingPageProps) {
  // Await searchParams if it's a Promise (Next.js 15)
  const params = await searchParams;
  const hasError = params.error === "true";
  const hasSuccess = params.success === "true";

  // Fetch billing history and subscription data
  const [billingHistoryResult, subscriptionResult] = await Promise.all([
    getBillingHistory(),
    getCurrentSubscription(),
  ]);

  const billingHistory = billingHistoryResult.success
    ? billingHistoryResult.data || []
    : [];
  const subscription = subscriptionResult.success
    ? subscriptionResult.data
    : {
        plan: "Free",
        status: "inactive",
        billingCycle: "monthly",
        amount: 0,
        nextBillingDate: null,
        startDate: null,
  };

  return (
    <BillingPageClient
      hasError={hasError}
      hasSuccess={hasSuccess}
      billingHistory={billingHistory}
      subscription={subscription}
    />
  );
}
