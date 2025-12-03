import {NextResponse} from "next/server";
import {getCurrentUser, getKYCData} from "@/utils/supabase/dal";

export async function GET() {
  try {
    // Use getCurrentUser instead of verifySession to avoid redirects in API routes
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {status: "NOT_STARTED", error: "Not authenticated"},
        {status: 401}
      );
    }

    const kycData = await getKYCData(currentUser.userId);
    const status = kycData?.status || "NOT_STARTED";

    return NextResponse.json({status, data: kycData});
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return NextResponse.json(
      {status: "NOT_STARTED", error: "Failed to fetch KYC status"},
      {status: 500}
    );
  }
}
