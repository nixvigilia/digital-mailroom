import {getCurrentUserPlanType} from "@/utils/supabase/dal";
import {getReferralData} from "@/app/actions/referrals";
import {getFreePlanData} from "@/app/actions/packages";
import {UserDashboardClient} from "@/components/user/UserDashboardClient";
import {Suspense} from "react";
import {DashboardSkeleton} from "@/components/user/skeletons/DashboardSkeleton";

/**
 * Main User Dashboard - Landing page for all users (free and paid)
 * Includes referral tracking and stats
 */
export default async function UserDashboardPage() {
  // We can fetch plan type immediately as it's fast (cached)
  const planType = await getCurrentUserPlanType();

  // Start fetching referral data but don't await it
  // This creates a Promise we can pass to the client component
  const referralDataPromise = getReferralData();
  const freePlanDataPromise = getFreePlanData();

  return (
    <Suspense fallback={<DashboardSkeleton isFreePlan={planType === "FREE"} />}>
      <UserDashboardClient
        planType={planType}
        referralDataPromise={referralDataPromise}
        freePlanDataPromise={freePlanDataPromise}
      />
    </Suspense>
  );
}
