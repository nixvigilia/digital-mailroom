import {getDisposeRequests} from "@/app/actions/operator-mail";
import DisposePageClient from "./DisposePageClient";

interface DisposePageProps {
  searchParams: Promise<{page?: string}>;
}

export default async function DisposePage({
  searchParams,
}: DisposePageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const pageSize = 10;

  const disposeData = await getDisposeRequests(currentPage, pageSize);

  return <DisposePageClient initialData={disposeData} />;
}

