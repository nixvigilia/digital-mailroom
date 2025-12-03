"use client";

import {SimpleGrid} from "@mantine/core";
import {StatsCardSkeleton} from "./StatsCardSkeleton";

interface StatsGridSkeletonProps {
  count?: number;
  cols?: {base?: number; sm?: number; lg?: number};
}

export function StatsGridSkeleton({
  count = 4,
  cols = {base: 1, sm: 2, lg: 4},
}: StatsGridSkeletonProps) {
  return (
    <SimpleGrid cols={cols} spacing="md">
      {Array.from({length: count}).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </SimpleGrid>
  );
}

