"use client";

import {useRef} from "react";
import {UnstyledButton, useMantineColorScheme} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconInbox,
  IconChecklist,
  IconLogout,
  IconSun,
  IconMoon,
  IconScan,
  IconTruck,
  IconTrash,
  IconUsers,
  IconHistory,
  IconMail,
  IconBox,
  IconMapPin,
  IconRuler,
} from "@tabler/icons-react";
import {UserButton} from "@/components/user/UserButton";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {signOut} from "@/app/actions/auth";
import classes from "./OperatorNavbar.module.css";

export interface OperatorNavbarRef {
  focusSearch: () => void;
}

const mainLinks = [
  {icon: IconLayoutDashboard, label: "Dashboard", href: "/operator"},
  {icon: IconMail, label: "Receive Mail", href: "/operator/receive"},
  {icon: IconChecklist, label: "KYC/KYB Review", href: "/operator/approvals"},
  {icon: IconScan, label: "Scanning", href: "/operator/scanning"},
  {icon: IconTruck, label: "Forwarding", href: "/operator/forwarding"},
  {icon: IconTrash, label: "Shredding", href: "/operator/shredding"},
  {icon: IconRuler, label: "Parcel Check", href: "/operator/parcel-check"},
  {icon: IconMapPin, label: "Lockers", href: "/operator/lockers"},
];

export function OperatorNavbar({
  searchRef,
  user,
}: {
  searchRef?: React.RefObject<HTMLInputElement | null>;
  user?: any;
}) {
  const pathname = usePathname();
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();

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
        <UserButton user={user} />
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
