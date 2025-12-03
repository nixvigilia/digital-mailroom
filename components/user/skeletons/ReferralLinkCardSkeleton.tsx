"use client";

import {Paper, Stack, Group, Divider, Skeleton} from "@mantine/core";

export function ReferralLinkCardSkeleton() {
  return (
    <Paper withBorder p="xl" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Stack gap="xs" style={{flex: 1}}>
            <Skeleton height={24} width="50%" radius="md" />
            <Skeleton height={18} width="80%" radius="md" />
          </Stack>
          <Skeleton height={28} width={80} radius="xl" />
        </Group>
        <Divider />
        <Stack gap="xs">
          <Skeleton height={18} width={120} radius="md" />
          <Skeleton height={48} width="100%" radius="md" />
        </Stack>
        <Stack gap="xs">
          <Skeleton height={18} width={120} radius="md" />
          <Skeleton height={48} width="100%" radius="md" />
        </Stack>
        <Divider />
        <Group gap="sm">
          <Skeleton height={36} style={{flex: 1}} radius="md" />
          <Skeleton height={36} style={{flex: 1}} radius="md" />
        </Group>
      </Stack>
    </Paper>
  );
}

