"use client";

import {Avatar, Group, Text, UnstyledButton, Box, Badge} from "@mantine/core";
import {IconChevronDown} from "@tabler/icons-react";
import classes from "./NavbarSearch.module.css";

export function UserButton({
  user,
  kycStatus,
}: {
  user?: any;
  kycStatus?: string;
}) {
  const getInitials = (email: string) => {
    if (!email) return "U";
    const username = email.split("@")[0];
    return username.charAt(0).toUpperCase();
  };

  const getUsername = (email: string) => {
    if (!email) return "User";
    return email.split("@")[0];
  };

  // Check if user has admin or operator role (assuming role is passed in metadata or we check based on user type if available)
  // Since we don't have full user object structure here, let's assume regular users are the only ones needing KYC display
  // But if user prop has role info, we can use it. For now, let's rely on the fact that this component is used in contexts where we might know.
  // Actually, looking at usage, user is from auth.getUser().
  // Let's hide it if kycStatus is undefined (which might happen for admins if not passed) OR explicitly check.
  // However, the request is "if admin or operator dont show".

  // We can check if the user metadata has role
  const role = user?.role || user?.user_metadata?.role;
  const isStaff =
    role === "ADMIN" || role === "OPERATOR" || role === "SYSTEM_ADMIN";

  return (
    <UnstyledButton className={classes.user}>
      <Group gap="md" wrap="nowrap" style={{flex: 1}}>
        <Avatar
          radius="xl"
          color="blue"
          size="md"
          style={{
            backgroundColor: "var(--mantine-color-blue-2)",
            color: "var(--mantine-color-blue-6)",
            fontWeight: 600,
          }}
        >
          {user?.email ? getInitials(user.email) : "U"}
        </Avatar>
        <Box style={{flex: 1, minWidth: 0}}>
          <Group gap="xs" align="center" wrap="nowrap">
            <Text size="sm" fw={600} truncate>
              {user?.email ? getUsername(user.email) : "User"}
            </Text>
          </Group>
          <Text c="dimmed" size="xs" truncate>
            {user?.email || ""}
          </Text>
          {!isStaff &&
            kycStatus &&
            (kycStatus === "APPROVED" ? (
              <Badge size="xs" variant="light" color="green">
                Verified
              </Badge>
            ) : (
              <Badge size="xs" variant="light" color="gray">
                Unverified
              </Badge>
            ))}
        </Box>
        {/* <IconChevronDown
          size={18}
          stroke={1.5}
          style={{
            color: "var(--mantine-color-gray-5)",
            flexShrink: 0,
          }}
        /> */}
      </Group>
    </UnstyledButton>
  );
}
