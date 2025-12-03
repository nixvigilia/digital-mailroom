import {BusinessLayoutClient} from "@/components/business/BusinessLayoutClient";

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BusinessLayoutClient>{children}</BusinessLayoutClient>;
}


