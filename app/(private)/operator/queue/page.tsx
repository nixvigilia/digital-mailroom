import {getActionQueue} from "@/app/actions/operator-mail";
import {ActionQueueClient} from "./ActionQueueClient";

export default async function ActionQueuePage() {
  const actionRequests = await getActionQueue();

  return <ActionQueueClient initialRequests={actionRequests} />;
}
