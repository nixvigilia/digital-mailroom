import {getCurrentUserPlanType} from "@/utils/supabase/dal";
import {PricingPageClient} from "./PricingPageClient";

export default async function PricingPage() {
  const currentPlanType = await getCurrentUserPlanType();
  return <PricingPageClient currentPlanType={currentPlanType} />;
}
