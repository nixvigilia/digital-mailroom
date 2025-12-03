"use client";

import {Title, Stack, Text} from "@mantine/core";
import {ReferralTable} from "@/components/free/ReferralTable";
import {use} from "react";

interface ReferralData {
  referralCode: string | null;
  referralLink: string | null;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  transactions: Array<{
    id: string;
    email: string;
    amount: number;
    status: string;
    date: Date;
    plan: string;
  }>;
}

interface ReferralsClientProps {
  referralDataPromise: Promise<ReferralData | null>;
}

export function ReferralsClient({referralDataPromise}: ReferralsClientProps) {
  const referralData = use(referralDataPromise);

  if (!referralData) {
    return (
      <Stack gap="xl" align="center" py="xl">
        <Text c="red">Error loading referral data</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={1} fw={800} size="h2">
          Referral History
        </Title>
        <Text c="dimmed" size="sm">
          View and manage your referral history
        </Text>
      </Stack>

      <ReferralTable transactions={referralData.transactions} />
    </Stack>
  );
}
