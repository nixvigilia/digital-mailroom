import {getCurrentUser, getUserAllMailboxes} from "@/utils/supabase/dal";
import {MailboxesPageClient} from "./MailboxesPageClient";

export default async function MailboxesPage() {
  const currentUser = await getCurrentUser();
  const allMailboxes = currentUser
    ? await getUserAllMailboxes(currentUser.userId)
    : [];

  return <MailboxesPageClient allMailboxes={allMailboxes} />;
}

