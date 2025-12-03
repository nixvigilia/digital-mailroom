"use client";

import {Paper, Stack, Group, Divider, Skeleton} from "@mantine/core";
import {ReferralLinkCardSkeleton} from "./ReferralLinkCardSkeleton";
import {StatsGridSkeleton} from "./StatsGridSkeleton";
import {ReferralTableSkeleton} from "./ReferralTableSkeleton";

export function ReferralSectionSkeleton() {
  return (
    <Paper withBorder p="xl" radius="md">
      <Stack gap="xl">
        {/* Section Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs" style={{flex: 1}}>
            <Skeleton height={32} width="40%" radius="md" />
            <Skeleton height={20} width="70%" radius="md" />
          </Stack>
          <Skeleton height={28} width={80} radius="xl" />
        </Group>

        <Divider />

        {/* Referral Link/Code Card */}
        <ReferralLinkCardSkeleton />

        {/* Stats Cards */}
        <StatsGridSkeleton count={4} />

        {/* Table */}
        <Paper withBorder p="xl" radius="md">
          <Stack gap="md">
            <Group gap="sm">
              <Skeleton height={24} width={24} radius="md" />
              <Skeleton height={28} width={150} radius="md" />
            </Group>
            <ReferralTableSkeleton />
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}

