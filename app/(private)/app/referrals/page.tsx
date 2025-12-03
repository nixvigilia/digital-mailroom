import {getReferralData} from "@/lib/referrals";
import {ReferralsClient} from "./ReferralsClient";

export default function ReferralsPage() {
  const referralDataPromise = getReferralData();

  return <ReferralsClient referralDataPromise={referralDataPromise} />;
}
