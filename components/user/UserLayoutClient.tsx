"use client";

import {Box, Drawer} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {NavbarSearch} from "@/components/user/NavbarSearch";
import {UserMobileNav} from "@/components/user/UserMobileNav";
import {MobileAccountMenu} from "@/components/user/MobileAccountMenu";

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
        {/* Mobile Drawer - Account Settings */}
        <Drawer
          opened={opened}
          onClose={close}
          title="Account"
          hiddenFrom="md"
          size="300px"
          styles={{body: {padding: 0}}}
          zIndex={300}
        >
          <MobileAccountMenu
            planType={planType}
            user={user}
            kycStatus={kycStatus}
            onClose={close}
          />
        </Drawer>

        {/* Page Content */}
        <Box
          p="xl"
          pb={{base: 100, md: "xl"}}
          style={{
            flex: 1,
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          {children}
        </Box>

        {/* Mobile Bottom Navigation */}
        <Box hiddenFrom="md">
          <UserMobileNav planType={planType} onOpenMenu={toggle} />
        </Box>
      </Box>
    </Box>
  );
}
