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
  Select,
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
  IconUsers,
  IconBuilding,
} from "@tabler/icons-react";
import {UserButton} from "@/components/user/appButton";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {signOut} from "@/app/actions/auth";
import classes from "./BusinessNavbar.module.css";

export interface BusinessNavbarRef {
  focusSearch: () => void;
}

const mainLinks = [
  {icon: IconInbox, label: "Shared Inbox", href: "/business/inbox"},
  {icon: IconArchive, label: "Archived", href: "/business/archived"},
  {icon: IconTag, label: "Tags & Categories", href: "/business/tags"},
  {icon: IconUsers, label: "Team", href: "/business/team"},
  {icon: IconSettings, label: "Settings", href: "/business/settings"},
  {icon: IconCreditCard, label: "Billing", href: "/business/billing"},
];

// Mock shared inboxes - will be replaced with backend
const sharedInboxes = [
  {value: "all", label: "All Mail"},
  {value: "finance", label: "Finance"},
  {value: "hr", label: "Human Resources"},
  {value: "legal", label: "Legal"},
  {value: "operations", label: "Operations"},
  {value: "general", label: "General"},
];

export function BusinessNavbar({
  searchRef,
}: {
  searchRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const pathname = usePathname();
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();
  const internalSearchRef = useRef<HTMLInputElement>(null);
  const searchInputRef = searchRef || internalSearchRef;
  const [selectedInbox, setSelectedInbox] = useState<string>("all");

  const mainLinksElements = mainLinks.map((link) => {
    const Icon = link.icon;
    const isActive =
      pathname === link.href || pathname?.startsWith(link.href + "/");
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

      {/* Shared Inbox Selector */}
      <div className={classes.section}>
        <div className={classes.inboxSelector}>
          <Group gap="xs" align="center" mb="xs">
            <IconBuilding size={18} className={classes.mainLinkIcon} />
            <Text size="sm" fw={600} c="dimmed">
              Shared Inboxes
            </Text>
          </Group>
          <Select
            value={selectedInbox}
            onChange={(value) => setSelectedInbox(value || "all")}
            data={sharedInboxes}
            size="sm"
            styles={{
              input: {
                backgroundColor: "var(--mantine-color-gray-0)",
                border: "1px solid var(--mantine-color-gray-3)",
              },
            }}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className={`${classes.section} ${classes.mainLinksSection}`}>
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
