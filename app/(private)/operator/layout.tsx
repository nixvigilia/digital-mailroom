import {OperatorLayoutClient} from "@/components/operator/OperatorLayoutClient";

export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OperatorLayoutClient>{children}</OperatorLayoutClient>;
}


