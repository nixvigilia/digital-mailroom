import {requirePaidPlan} from "@/utils/supabase/route-guard";
import {SettingsPageClient} from "./SettingsPageClient";
import {getSettings} from "@/app/actions/settings";

export default async function SettingsPage() {
  await requirePaidPlan();
  const settings = await getSettings();

  return (
    <SettingsPageClient
      initialSettings={
        settings.success
          ? settings.data
          : {
              email: "",
              firstName: "",
              lastName: "",
              notifications: {
                newMail: true,
                referrals: true,
                marketing: false,
              },
            }
      }
    />
  );
}
