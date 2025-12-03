"use client";

import {
  SimpleGrid,
  Paper,
  Text,
  Stack,
  Group,
  Title,
  ThemeIcon,
} from "@mantine/core";
import {
  IconUsers,
  IconUserCheck,
  IconBuildingStore,
  IconShieldLock,
} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import {getUsers} from "@/app/actions/admin-users";

export default function AdminDashboardClient() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    operators: 0,
    individuals: 0,
    businesses: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const {data} = await getUsers();
      if (data) {
        setStats({
          totalUsers: data.length,
          operators: data.filter((u) => u.role === "OPERATOR").length,
          individuals: data.filter((u) => u.userType === "INDIVIDUAL").length,
          businesses: data.filter((u) => u.userType === "BUSINESS").length,
        });
      }
    }
    fetchStats();
  }, []);

  return (
    <Stack gap="lg">
      <Title order={2}>Dashboard Overview</Title>

      <SimpleGrid cols={{base: 1, sm: 2, lg: 4}}>
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <Stack gap={0}>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                Total Users
              </Text>
              <Text fw={700} size="xl">
                {stats.totalUsers}
              </Text>
            </Stack>
            <ThemeIcon color="blue" variant="light" size="lg">
              <IconUsers size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <Stack gap={0}>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                Operators
              </Text>
              <Text fw={700} size="xl">
                {stats.operators}
              </Text>
            </Stack>
            <ThemeIcon color="orange" variant="light" size="lg">
              <IconShieldLock size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <Stack gap={0}>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                Individuals
              </Text>
              <Text fw={700} size="xl">
                {stats.individuals}
              </Text>
            </Stack>
            <ThemeIcon color="teal" variant="light" size="lg">
              <IconUserCheck size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <Stack gap={0}>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                Businesses
              </Text>
              <Text fw={700} size="xl">
                {stats.businesses}
              </Text>
            </Stack>
            <ThemeIcon color="indigo" variant="light" size="lg">
              <IconBuildingStore size={20} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
