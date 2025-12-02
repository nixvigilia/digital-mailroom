import {requirePaidPlan} from "@/utils/supabase/route-guard";
import {ArchivedPageClient} from "./ArchivedPageClient";

export default async function ArchivedPage() {
  await requirePaidPlan();
  return <ArchivedPageClient />;
}
