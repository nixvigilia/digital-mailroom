import {getForwardRequests} from "@/app/actions/operator-mail";
import ForwardingPageClient from "./ForwardingPageClient";

interface ForwardingPageProps {
  searchParams: Promise<{page?: string}>;
}

export default async function ForwardingPage({
  searchParams,
}: ForwardingPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const pageSize = 10;

  const forwardData = await getForwardRequests(currentPage, pageSize);

  return <ForwardingPageClient initialData={forwardData} />;
}
