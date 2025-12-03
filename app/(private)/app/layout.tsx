import {UserLayoutClient} from "@/components/user/UserLayoutClient";
import {
  getCurrentUserPlanType,
  getCurrentUser,
  getKYCStatus,
} from "@/utils/supabase/dal";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [planType, currentUser] = await Promise.all([
    getCurrentUserPlanType(),
    getCurrentUser(),
  ]);

  const kycStatus = currentUser
    ? await getKYCStatus(currentUser.userId)
    : "NOT_STARTED";

  return (
    <UserLayoutClient
      planType={planType}
      user={currentUser?.user}
      kycStatus={kycStatus}
    >
      {children}
    </UserLayoutClient>
  );
}
