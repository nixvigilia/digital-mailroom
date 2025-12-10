import {isIpAllowed} from "@/utils/ip-check";
import {notFound} from "next/navigation";

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ipAllowed = await isIpAllowed();
  console.log("ipAllowed", ipAllowed);

  if (!ipAllowed) {
    notFound();
  }

  return <>{children}</>;
}
