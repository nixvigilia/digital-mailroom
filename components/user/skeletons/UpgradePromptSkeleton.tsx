"use client";

import {Paper, Stack, Skeleton} from "@mantine/core";

export function UpgradePromptSkeleton() {
  return (
    <Paper withBorder p="xl" radius="md" style={{textAlign: "center"}}>
      <Stack gap="md" align="center">
        <Skeleton height={32} width="60%" radius="md" />
        <Skeleton height={20} width="80%" radius="md" />
        <Skeleton height={40} width={150} radius="md" />
      </Stack>
    </Paper>
  );
}

