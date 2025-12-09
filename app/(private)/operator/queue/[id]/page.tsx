import {getMailItemDetails} from "@/app/actions/operator-mail";
import {MailQueueItemClient} from "./MailQueueItemClient";
import {Text, Center} from "@mantine/core";

interface PageProps {
  params: Promise<{id: string}>;
}

export default async function MailItemDetailPage({params}: PageProps) {
  const {id} = await params;
  const mailItem = await getMailItemDetails(id);

  if (!mailItem) {
  return (
      <Center style={{height: "100vh"}}>
        <Text>Mail item not found or access denied.</Text>
      </Center>
    );
  }

  return <MailQueueItemClient mailItem={mailItem} />;
}
