import {redirect, notFound} from "next/navigation";
import {createClient} from "@/utils/supabase/server";
import {prisma} from "@/utils/prisma";
import {UserRole} from "@/app/generated/prisma/enums";
import AdminLayoutClient from "./AdminLayoutClient";
import {isIpAllowed} from "@/utils/ip-check";

export default async function AdminLayout({
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

  // Check role - Admin section is SYSTEM_ADMIN only
  const profile = await prisma.profile.findUnique({
    where: {id: user.id},
    select: {role: true},
  });

  if (!profile || profile.role !== UserRole.SYSTEM_ADMIN) {
    // Not an admin, redirect operators to operator dashboard, others to user dashboard
    if (profile?.role === UserRole.OPERATOR) {
      redirect("/operator");
    }
    redirect("/app");
  }

  return (
    <AdminLayoutClient userRole={profile.role}>{children}</AdminLayoutClient>
  );
}
