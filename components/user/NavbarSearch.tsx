"use client";

import {useRef} from "react";
import {
  Avatar,
  UnstyledButton,
  useMantineColorScheme,
  Group,
} from "@mantine/core";
import {
  IconInbox,
  IconArchive,
  IconTag,
  IconSettings,
  IconCreditCard,
  IconSun,
  IconMoon,
  IconLayoutDashboard,
  IconHistory,
  IconBox,
} from "@tabler/icons-react";
import {UserButton} from "@/components/user/UserButton";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {signOut} from "@/app/actions/auth";
import classes from "./NavbarSearch.module.css";
import {createClient} from "@/utils/supabase/client";
import {useEffect, useState} from "react";

export interface NavbarSearchRef {
  focusSearch: () => void;
}

const mainLinks = [
  {icon: IconLayoutDashboard, label: "Dashboard", href: "/app"},
  {icon: IconBox, label: "My Mailboxes", href: "/app/mailboxes"},
  {icon: IconInbox, label: "Inbox", href: "/app/inbox"},
  // Archived page hidden - not needed yet
  // {icon: IconArchive, label: "Archived", href: "/app/archived"},
  {icon: IconTag, label: "Tags & Categories", href: "/app/tags"},
  {icon: IconSettings, label: "Settings", href: "/app/settings"},
  {icon: IconCreditCard, label: "Billing", href: "/app/billing"},
  {icon: IconCreditCard, label: "Pricing", href: "/app/pricing"},
];

export function NavbarSearch({
  searchRef,
  planType,
  user,
  kycStatus,
}: {
  searchRef?: React.RefObject<HTMLInputElement | null>;
  planType?: string;
  user?: any;
  kycStatus?: string;
}) {
  const pathname = usePathname();
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();
  const isFreePlan = planType === "FREE";

  const getInitials = (email: string) => {
    if (!email) return "U";
    const username = email.split("@")[0];
    return username.charAt(0).toUpperCase();
  };

  // Filter links based on plan type
  let visibleLinks = [];
  if (isFreePlan) {
    visibleLinks = [
      {icon: IconLayoutDashboard, label: "Dashboard", href: "/app"},
      {icon: IconHistory, label: "Referral History", href: "/app/referrals"},
      {icon: IconCreditCard, label: "Pricing", href: "/app/pricing"},
    ];
  } else {
    visibleLinks = mainLinks.filter((link) => link.href !== "/app/pricing");
  }

  const mainLinksElements = visibleLinks.map((link) => {
    const Icon = link.icon;
    const isActive =
      pathname === link.href ||
      (link.href !== "/app" && pathname?.startsWith(link.href));
    return (
      <UnstyledButton
        key={link.label}
        component={Link}
        href={link.href}
        className={`${classes.mainLink} ${isActive ? classes.active : ""}`}
      >
        <div className={classes.mainLinkInner}>
          <Icon size={20} className={classes.mainLinkIcon} stroke={1.5} />
          <span>{link.label}</span>
        </div>
      </UnstyledButton>
    );
  });

  return (
    <nav className={classes.navbar}>
      {/* User Account Section */}
      <div className={classes.userSection}>
        <UserButton user={user} kycStatus={kycStatus} />
      </div>

      {/* Navigation Links */}
      <div className={classes.section}>
        <div className={classes.mainLinks}>{mainLinksElements}</div>
      </div>

      {/* Bottom Actions */}
      <div className={classes.bottomSection}>
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
            <span>Toggle Theme</span>
          </div>
        </UnstyledButton>

        <form action={signOut}>
          <UnstyledButton type="submit" className={classes.mainLink}>
            <div className={classes.mainLinkInner}>
              {/* Sign Out Avatar style from reference */}
              <Avatar
                radius="xl"
                size="sm"
                mr="md"
                style={{
                  width: 24,
                  height: 24,
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: "var(--mantine-color-gray-7)",
                  color: "var(--mantine-color-white)",
                }}
              >
                {user?.email ? getInitials(user.email) : "U"}
              </Avatar>
              <span>Sign Out</span>
            </div>
          </UnstyledButton>
        </form>
      </div>
    </nav>
  );
}
