"use client";

import {Box, Drawer, Burger, Group, ActionIcon, Tooltip} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {useMantineColorScheme} from "@mantine/core";
import {IconSun, IconMoon} from "@tabler/icons-react";
import {NavbarSearch} from "@/components/user/NavbarSearch";

interface UserLayoutClientProps {
  children: React.ReactNode;
  planType?: string;
  user?: any;
  kycStatus?: string;
}

export function UserLayoutClient({
  children,
  planType,
  user,
  kycStatus,
}: UserLayoutClientProps) {
  const [opened, {toggle, close}] = useDisclosure(false);
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();

  return (
    <Box style={{display: "flex", minHeight: "100vh"}}>
      {/* Desktop Sidebar */}
      <Box visibleFrom="md" style={{flexShrink: 0}}>
        <NavbarSearch planType={planType} user={user} kycStatus={kycStatus} />
      </Box>

      {/* Main Content */}
      <Box
        style={{flex: 1, minWidth: 0, display: "flex", flexDirection: "column"}}
      >
        {/* Mobile Burger Menu and Dark Mode Toggle */}
        <Group justify="space-between" p="md" hiddenFrom="md">
          <Tooltip label="Toggle color scheme (Ctrl+J)" withArrow>
            <ActionIcon
              variant="default"
              size="lg"
              onClick={() => toggleColorScheme()}
              aria-label="Toggle color scheme"
            >
              {colorScheme === "dark" ? (
                <IconSun size={18} />
              ) : (
                <IconMoon size={18} />
              )}
            </ActionIcon>
          </Tooltip>
          <Burger opened={opened} onClick={toggle} size="sm" />
        </Group>

        {/* Mobile Drawer */}
        <Drawer
          opened={opened}
          onClose={close}
          title="Navigation"
          hiddenFrom="md"
          size="300px"
          styles={{body: {padding: 0}}}
        >
          <NavbarSearch planType={planType} user={user} kycStatus={kycStatus} />
        </Drawer>

        {/* Page Content */}
        <Box
          style={{
            flex: 1,
            padding: "var(--mantine-spacing-xl)",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
