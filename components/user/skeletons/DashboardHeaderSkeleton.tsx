"use client";

import {Stack, Group, Skeleton} from "@mantine/core";

interface DashboardHeaderSkeletonProps {
  showButton?: boolean;
}

export function DashboardHeaderSkeleton({
  showButton = false,
}: DashboardHeaderSkeletonProps) {
  return (
    <Stack gap="xs">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap="xs" style={{flex: 1}}>
          <Skeleton height={48} width="60%" radius="md" />
          <Skeleton height={24} width="80%" radius="md" />
        </Stack>
        {showButton && <Skeleton height={40} width={140} radius="md" />}
      </Group>
    </Stack>
  );
}

