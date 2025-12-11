"use client";

import {
  UnstyledButton,
  useMantineColorScheme,
  Group,
  Text,
  Stack,
  Divider,
  Avatar,
  ThemeIcon,
} from "@mantine/core";
import {
  IconSettings,
  IconCreditCard,
  IconSun,
  IconMoon,
  IconLogout,
} from "@tabler/icons-react";
import { UserButton } from "@/components/user/UserButton";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import classes from "./NavbarSearch.module.css"; // Reuse existing styles
import { usePathname } from "next/navigation";

export function MobileAccountMenu({
  planType,
  user,
  kycStatus,
  onClose,
}: {
  planType?: string;
  user?: any;
  kycStatus?: string;
  onClose: () => void;
}) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const pathname = usePathname();
  const isFreePlan = planType === "FREE";

  const getInitials = (email: string) => {
    if (!email) return "U";
    const username = email.split("@")[0];
    return username.charAt(0).toUpperCase();
  };

  // Define account-specific links
  // For Paid users, Settings and Billing are not in the bottom nav, so we show them here.
  // For Free users, Pricing is in the bottom nav, but Settings is not shown in the main list.
  // We'll show Settings for everyone here as it's an "Account" menu.
  const accountLinks = [
    { icon: IconSettings, label: "Settings", href: "/app/settings" },
  ];

  if (!isFreePlan) {
    accountLinks.push({
      icon: IconCreditCard,
      label: "Billing",
      href: "/app/billing",
    });
  }

  return (
    <Stack gap={0} h="100%">
      {/* Header / User Profile */}
      <div className={classes.userSection} style={{ paddingBottom: 0 }}>
        <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">
          Account
        </Text>
        <UserButton user={user} kycStatus={kycStatus} />
      </div>

      <Divider my="md" />

      {/* Account Settings Links */}
      <div className={classes.section}>
        <div className={classes.mainLinks}>
          {accountLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <UnstyledButton
                key={link.label}
                component={Link}
                href={link.href}
                onClick={onClose}
                className={`${classes.mainLink} ${isActive ? classes.active : ""}`}
              >
                <div className={classes.mainLinkInner}>
                  <Icon
                    size={20}
                    className={classes.mainLinkInner}
                    style={{ marginRight: 12, opacity: 0.7 }}
                    stroke={1.5}
                  />
                  <span>{link.label}</span>
                </div>
              </UnstyledButton>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className={classes.bottomSection} style={{ padding: "var(--mantine-spacing-md)" }}>
         <UnstyledButton
          onClick={() => toggleColorScheme()}
          className={classes.mainLink}
        >
          <div className={classes.mainLinkInner}>
            {colorScheme === "dark" ? (
              <IconSun
                size={20}
                className={classes.mainLinkIcon}
                stroke={1.5}
              />
            ) : (
              <IconMoon
                size={20}
                className={classes.mainLinkIcon}
                stroke={1.5}
              />
            )}
            <span>
              Switch to {colorScheme === "dark" ? "Light" : "Dark"} Mode
            </span>
          </div>
        </UnstyledButton>
        
        <form action={signOut}>
          <UnstyledButton type="submit" className={classes.mainLink}>
            <div className={classes.mainLinkInner}>
              <ThemeIcon variant="light" color="gray" size="sm" mr="md" radius="xl">
                <IconLogout size={14} />
              </ThemeIcon>
              <span>Sign Out</span>
            </div>
          </UnstyledButton>
        </form>
      </div>
    </Stack>
  );
}



