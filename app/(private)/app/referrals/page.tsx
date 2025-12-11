import {getReferralData} from "@/lib/referrals";
import {ReferralsClient} from "./ReferralsClient";

/**
 * Referral History Page
 * Accessible to all users (free and paid)
 * Free users can view their referral history and earnings
 */
export default function ReferralsPage() {
  const referralDataPromise = getReferralData();

  return <ReferralsClient referralDataPromise={referralDataPromise} />;
}
