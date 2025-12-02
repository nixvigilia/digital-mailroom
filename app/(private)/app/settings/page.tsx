import {requirePaidPlan} from "@/utils/supabase/route-guard";
import {SettingsPageClient} from "./SettingsPageClient";

export default async function SettingsPage() {
  await requirePaidPlan();
  return <SettingsPageClient />;
}
