"use client";

import {Paper, Stack, Group, Skeleton} from "@mantine/core";

export function StatsCardSkeleton() {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <Skeleton height={16} width={100} radius="md" />
          <Skeleton height={40} width={40} radius="md" />
        </Group>
        <Skeleton height={32} width={80} radius="md" />
        <Skeleton height={28} width={100} radius="md" />
      </Stack>
    </Paper>
  );
}

