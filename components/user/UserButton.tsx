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
          {kycStatus === "APPROVED" ? (
            <Badge size="xs" variant="light" color="green">
              Verified
            </Badge>
          ) : (
            <Badge size="xs" variant="light" color="gray">
              Unverified
            </Badge>
          )}
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
