import {redirect} from "next/navigation";
import {createClient} from "@/utils/supabase/server";
import {prisma} from "@/utils/prisma";
import {UserRole} from "@/app/generated/prisma/enums";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
      }

  const profile = await prisma.profile.findUnique({
    where: {id: user.id},
    select: {role: true},
      });

  if (profile?.role === UserRole.OPERATOR) {
    redirect("/operator");
  }

  if (profile?.role !== UserRole.SYSTEM_ADMIN) {
    redirect("/app");
  }

  return <AdminSettingsClient />;
}
