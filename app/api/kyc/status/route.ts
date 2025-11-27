import {NextResponse} from "next/server";
import {getCurrentUser, getKYCStatus} from "@/utils/supabase/dal";

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

    const status = await getKYCStatus(currentUser.userId);

    return NextResponse.json({status});
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return NextResponse.json(
      {status: "NOT_STARTED", error: "Failed to fetch KYC status"},
      {status: 500}
    );
  }
}
