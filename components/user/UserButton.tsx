"use client";

import {Avatar, Group, Text, UnstyledButton, Box} from "@mantine/core";
import {IconChevronDown} from "@tabler/icons-react";
import {createClient} from "@/utils/supabase/client";
import {useEffect, useState} from "react";
import classes from "./NavbarSearch.module.css";

export function UserButton() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

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
          <Text size="sm" fw={600} truncate>
            {user?.email ? getUsername(user.email) : "User"}
          </Text>
          <Text c="dimmed" size="xs" truncate>
            {user?.email || ""}
          </Text>
        </Box>
        <IconChevronDown
          size={18}
          stroke={1.5}
          style={{
            color: "var(--mantine-color-gray-5)",
            flexShrink: 0,
          }}
        />
      </Group>
    </UnstyledButton>
  );
}


