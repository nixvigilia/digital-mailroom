"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  IconLayoutDashboard,
  IconInbox,
  IconArchive,
  IconTag,
  IconHistory,
  IconCreditCard,
  IconUser,
} from "@tabler/icons-react";
import classes from "./UserMobileNav.module.css";
import { Box } from "@mantine/core";

interface UserMobileNavProps {
  planType?: string;
  onOpenMenu: () => void;
}

export function UserMobileNav({ planType, onOpenMenu }: UserMobileNavProps) {
  const pathname = usePathname();
  const isFreePlan = planType === "FREE";

  // Primary mobile actions
  const links = isFreePlan
    ? [
        { icon: IconLayoutDashboard, label: "Home", href: "/app" },
        { icon: IconHistory, label: "Referrals", href: "/app/referrals" },
        { icon: IconCreditCard, label: "Pricing", href: "/app/pricing" },
      ]
    : [
        { icon: IconLayoutDashboard, label: "Home", href: "/app" },
        { icon: IconInbox, label: "Inbox", href: "/app/inbox" },
        { icon: IconArchive, label: "Archive", href: "/app/archived" },
        { icon: IconTag, label: "Tags", href: "/app/tags" },
      ];

  return (
    <nav className={classes.mobileNav}>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          link.href === "/app"
            ? pathname === "/app"
            : pathname?.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${classes.navItem} ${isActive ? classes.active : ""}`}
          >
            <Icon size={22} stroke={1.5} />
            <span>{link.label}</span>
          </Link>
        );
      })}

      {/* Account Button */}
      <Box
        component="button"
        onClick={onOpenMenu}
        className={classes.navItem}
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <IconUser size={22} stroke={1.5} />
        <span>Account</span>
      </Box>
    </nav>
  );
}
