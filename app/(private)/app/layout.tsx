import {UserLayoutClient} from "@/components/user/UserLayoutClient";
import {getCurrentUserPlanType} from "@/utils/supabase/dal";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const planType = await getCurrentUserPlanType();
  return <UserLayoutClient planType={planType}>{children}</UserLayoutClient>;
}
