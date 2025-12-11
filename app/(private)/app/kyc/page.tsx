import {redirect} from "next/navigation";
import {getCurrentUser, getKYCStatus, getKYCData} from "@/utils/supabase/dal";
import KYCPageClient from "./KYCPageClient";

export default async function KYCPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const userId = currentUser.userId;

  // Check KYC status on server before rendering anything
  const kycStatus = await getKYCStatus(userId);

  // Redirect immediately if PENDING - no UI should be shown
  if (kycStatus === "PENDING") {
    redirect("/app");
  }

  // Redirect if APPROVED
  if (kycStatus === "APPROVED") {
    redirect("/app");
  }

  // Get KYC data for NOT_STARTED or REJECTED status
  const kycData = await getKYCData(userId);

  return (
    <KYCPageClient
      initialStatus={kycStatus}
      initialData={kycData}
      rejectionReason={kycData?.rejection_reason || null}
    />
  );
}
