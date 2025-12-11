import {getScanRequests} from "@/app/actions/operator-mail";
import {ScanningPageClient} from "./ScanningPageClient";

interface ScanningPageProps {
  searchParams: Promise<{page?: string}>;
}

export default async function ScanningPage({searchParams}: ScanningPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = 10;

  const scanData = await getScanRequests(page, pageSize);

  return <ScanningPageClient initialData={scanData} />;
}

