import {getCurrentUser, getUserAllMailboxes} from "@/utils/supabase/dal";
import {BillingPageClient} from "./BillingPageClient";

export default async function BillingPage() {
  const currentUser = await getCurrentUser();
  const allMailboxes = currentUser
    ? await getUserAllMailboxes(currentUser.userId)
    : [];

  return <BillingPageClient allMailboxes={allMailboxes} />;
}
