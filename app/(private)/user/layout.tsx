import {UserLayoutClient} from "@/components/user/UserLayoutClient";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
