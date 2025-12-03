import {redirect} from "next/navigation";
import {createClient} from "@/utils/supabase/server";
import {prisma} from "@/utils/prisma";
import {UserRole} from "@/app/generated/prisma/enums";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    (profile.role !== UserRole.SYSTEM_ADMIN &&
      profile.role !== UserRole.OPERATOR)
  ) {
    // Not an admin or operator, redirect to user dashboard
    redirect("/app");
  }

  return (
    <AdminLayoutClient userRole={profile.role}>{children}</AdminLayoutClient>
  );
}
