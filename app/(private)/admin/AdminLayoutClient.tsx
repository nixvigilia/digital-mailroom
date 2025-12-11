"use client";

import {
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {
  IconDashboard,
  IconUsers,
  IconSettings,
  IconLogout,
  IconHistory,
  IconArrowLeft,
  IconPackage,
  IconShield,
} from "@tabler/icons-react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {createClient} from "@/utils/supabase/client";
import {useRouter} from "next/navigation";
import {UserRole} from "@/app/generated/prisma/enums";

export default function AdminLayoutClient({
  children,
  userRole,
}: {
  children: React.ReactNode;
  userRole: UserRole;
}) {
  const [opened, {toggle}] = useDisclosure();
  const theme = useMantineTheme();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const isOperator = userRole === UserRole.OPERATOR;

  return (
    <AppShell
      header={{height: 60}}
      navbar={{width: 300, breakpoint: "sm", collapsed: {mobile: !opened}}}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={3}>Admin Portal</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          {isOperator && (
            <NavLink
              component={Link}
              href="/operator"
              label="Back to Operator Dashboard"
              leftSection={<IconArrowLeft size={20} />}
              color="orange"
              variant="filled"
              mb="md"
            />
          )}

          {!isOperator && (
          <NavLink
            component={Link}
            href="/admin"
            label="Dashboard"
            leftSection={<IconDashboard size={20} />}
            active={pathname === "/admin"}
          />
          )}

          <NavLink
            component={Link}
            href="/admin/users"
            label="User Management"
            leftSection={<IconUsers size={20} />}
            active={pathname.startsWith("/admin/users")}
          />
          {!isOperator && (
            <NavLink
              component={Link}
              href="/admin/packages"
              label="Packages"
              leftSection={<IconPackage size={20} />}
              active={pathname.startsWith("/admin/packages")}
            />
          )}
          <NavLink
            component={Link}
            href="/admin/logs"
            label="Activity Logs"
            leftSection={<IconHistory size={20} />}
            active={pathname.startsWith("/admin/logs")}
          />

          {!isOperator && (
            <NavLink
              component={Link}
              href="/admin/ip-whitelist"
              label="IP Whitelist"
              leftSection={<IconShield size={20} />}
              active={pathname.startsWith("/admin/ip-whitelist")}
            />
          )}
          {!isOperator && (
            <NavLink
              component={Link}
              href="/admin/settings"
              label="Settings"
              leftSection={<IconSettings size={20} />}
              active={pathname.startsWith("/admin/settings")}
            />
          )}
        </AppShell.Section>
        <AppShell.Section>
          <NavLink
            label="Logout"
            leftSection={<IconLogout size={20} />}
            onClick={handleLogout}
            color="red"
          />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
