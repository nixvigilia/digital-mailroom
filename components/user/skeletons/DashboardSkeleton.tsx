"use client";

import {Stack} from "@mantine/core";
import {DashboardHeaderSkeleton} from "./DashboardHeaderSkeleton";
import {StatsGridSkeleton} from "./StatsGridSkeleton";
import {ReferralSectionSkeleton} from "./ReferralSectionSkeleton";
import {UpgradePromptSkeleton} from "./UpgradePromptSkeleton";

interface DashboardSkeletonProps {
  isFreePlan?: boolean;
}

export function DashboardSkeleton({
  isFreePlan = false,
}: DashboardSkeletonProps) {
  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <DashboardHeaderSkeleton showButton={!isFreePlan} />

      {/* Quick Stats for Paid Users */}
      {!isFreePlan && <StatsGridSkeleton count={4} />}

      {/* Referral Section */}
      <ReferralSectionSkeleton />

      {/* Free Plan Upgrade Prompt */}
      {isFreePlan && <UpgradePromptSkeleton />}
    </Stack>
  );
}

