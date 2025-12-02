"use client";

import {useRef, useState, useEffect} from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Code,
  Group,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconInbox,
  IconArchive,
  IconTag,
  IconSettings,
  IconCreditCard,
  IconLogout,
  IconSearch,
  IconSun,
  IconMoon,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import {UserButton} from "@/components/user/UserButton";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {signOut} from "@/app/actions/auth";
import classes from "./NavbarSearch.module.css";

export interface NavbarSearchRef {
  focusSearch: () => void;
}

const mainLinks = [
  {icon: IconLayoutDashboard, label: "Dashboard", href: "/app"},
  {icon: IconInbox, label: "Inbox", href: "/app/inbox"},
  {icon: IconArchive, label: "Archived", href: "/app/archived"},
  {icon: IconTag, label: "Tags & Categories", href: "/app/tags"},
  {icon: IconSettings, label: "Settings", href: "/app/settings"},
  {icon: IconCreditCard, label: "Billing", href: "/app/billing"},
  {icon: IconCreditCard, label: "Pricing", href: "/app/pricing"},
];

export function NavbarSearch({
  searchRef,
  planType,
}: {
  searchRef?: React.RefObject<HTMLInputElement | null>;
  planType?: string;
}) {
  const pathname = usePathname();
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();
  const internalSearchRef = useRef<HTMLInputElement>(null);
  const searchInputRef = searchRef || internalSearchRef;
  const isFreePlan = planType === "FREE";

  // Filter links based on plan type
  // Dashboard is available to all users
  // Pricing is only for free users
  const visibleLinks = isFreePlan
    ? mainLinks.filter(
        (link) =>
          link.href === "/app" ||
          link.href === "/app/pricing" ||
          link.href === "/app/settings"
      )
    : mainLinks.filter((link) => link.href !== "/app/pricing"); // Hide pricing for paid users, show everything else

  const mainLinksElements = visibleLinks.map((link) => {
    const Icon = link.icon;
    const isActive = pathname === link.href;
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
        <UserButton />
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
              <IconLogout
                size={20}
                className={classes.mainLinkIcon}
                stroke={1.5}
              />
              <span>Sign Out</span>
            </div>
          </UnstyledButton>
        </form>
      </div>
    </nav>
  );
}
