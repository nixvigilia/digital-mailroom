import {requirePaidPlan} from "@/utils/supabase/route-guard";
import {getCurrentUserKYCStatus} from "@/utils/supabase/dal";
import {ArchivedPageClient} from "./ArchivedPageClient";

export default async function ArchivedPage() {
  await requirePaidPlan();
  const kycStatus = await getCurrentUserKYCStatus();

  return <ArchivedPageClient kycStatus={kycStatus} />;
}
