import {requirePaidPlan} from "@/utils/supabase/route-guard";
import {TagsPageClient} from "./TagsPageClient";

export default async function TagsPage() {
  await requirePaidPlan();
  return <TagsPageClient />;
}
