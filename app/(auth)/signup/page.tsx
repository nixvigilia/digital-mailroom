import {SignupClient} from "./SignupClient";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ref?: string}>;
}) {
  const {ref} = await searchParams;

  return <SignupClient referralCode={ref || null} />;
}
