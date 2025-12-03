import {NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";
import {verifyOperatorAccess} from "@/lib/packages";
import {KYCRequest} from "@/app/actions/operator-kyc";

export async function GET() {
  try {
    const access = await verifyOperatorAccess();
    if (!access.success) {
      return NextResponse.json(
        {success: false, message: access.message},
        {status: 401}
      );
    }

    const pendingKYC = await prisma.kYCVerification.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        profile: {
          select: {
            email: true,
            user_type: true,
            business_account: {
              select: {
                business_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        submitted_at: "asc",
      },
    });

    const formattedData: KYCRequest[] = pendingKYC.map((kyc) => ({
      id: kyc.id,
      profileId: kyc.profile_id,
      firstName: kyc.first_name,
      lastName: kyc.last_name,
      status: kyc.status,
      submittedAt: kyc.submitted_at,
      userType: kyc.profile.user_type,
      email: kyc.profile.email,
      businessName: kyc.profile.business_account?.business_name,
    }));

    return NextResponse.json({success: true, data: formattedData});
  } catch (error) {
    console.error("Error fetching pending KYC requests:", error);
    return NextResponse.json(
      {success: false, message: "Failed to fetch pending requests"},
      {status: 500}
    );
  }
}
