import {getCurrentUserPlanType} from "@/utils/supabase/dal";
import {PricingPageClient} from "./PricingPageClient";
import {getPublicPackages} from "@/lib/packages";
import {getPublicMailingLocations} from "@/app/actions/payment";
import {Suspense} from "react";

export default async function PricingPage() {
  const currentPlanType = await getCurrentUserPlanType();
  const packagesPromise = getPublicPackages();
  const locationsPromise = getPublicMailingLocations();

  return (
    <Suspense fallback={<div>Loading pricing...</div>}>
      <PricingPageClient
        currentPlanType={currentPlanType}
        packagesPromise={packagesPromise}
        locationsPromise={locationsPromise}
      />
    </Suspense>
  );
}
