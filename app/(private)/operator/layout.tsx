import {OperatorLayoutClient} from "@/components/operator/OperatorLayoutClient";
import {redirect, notFound} from "next/navigation";
import {createClient} from "@/utils/supabase/server";
import {prisma} from "@/utils/prisma";
import {UserRole} from "@/app/generated/prisma/enums";
import {isIpAllowed} from "@/utils/ip-check";

export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check IP Allowlist
  const ipAllowed = await isIpAllowed();
  if (!ipAllowed) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  // Check role
  const profile = await prisma.profile.findUnique({
    where: {id: user.id},
    select: {role: true},
  });

  if (
    !profile ||
    (profile.role !== UserRole.OPERATOR &&
      profile.role !== UserRole.SYSTEM_ADMIN)
  ) {
    // Not an operator or admin, redirect to user dashboard
    redirect("/app");
  }

  const userWithRole = {
    ...user,
    role: profile.role,
  };

  return (
    <OperatorLayoutClient user={userWithRole}>{children}</OperatorLayoutClient>
  );
}
