"use client";

import {useState, use, Suspense} from "react";
import {useRouter} from "next/navigation";
import {
  Title,
  Text,
  Stack,
  SimpleGrid,
  Group,
  Badge,
  Button,
  ThemeIcon,
  Card,
  Skeleton,
} from "@mantine/core";
import {
  IconUsers,
  IconTrendingUp,
  IconCash,
  IconMail,
  IconInbox,
  IconArrowRight,
  IconShieldLock,
} from "@tabler/icons-react";
import {ReferralLinkCard} from "@/components/free/ReferralLinkCard";
import {ReferralStatsCard} from "@/components/free/ReferralStatsCard";
import {ReferralTable} from "@/components/free/ReferralTable";
import {GenerateReferralCodeCard} from "@/components/free/GenerateReferralCodeCard";
import Link from "next/link";
import {DashboardSkeleton} from "./skeletons/DashboardSkeleton";

interface ReferralData {
  referralCode: string | null;
  referralLink: string | null;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  referrals: Array<{
    id: string;
    email: string;
    planType: string;
    joinedAt: Date;
    status: "active" | "pending";
    earnings: number;
  }>;
}

interface UserDashboardClientProps {
  planType: string;
  referralDataPromise: Promise<ReferralData | null>;
  freePlanDataPromise: Promise<{
    description: string | null;
    features: string[];
  } | null>;
}

export function UserDashboardClient({
  planType,
  referralDataPromise,
  freePlanDataPromise,
}: UserDashboardClientProps) {
  const referralData = use(referralDataPromise);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const isFreePlan = planType === "FREE";

  const handleCopyLink = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleCodeGenerated = () => {
    router.refresh();
  };

  if (!referralData) {
    return (
      <Stack gap="xl" align="center" py="xl">
        <Text c="red">Error loading dashboard data</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={4}>
          <Group gap="xs" align="center">
            <Title order={1} fw={800} size="h2">
              Dashboard
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            {isFreePlan
              ? "Track referrals and manage your rewards"
              : "Manage your mail and track earnings"}
          </Text>
        </Stack>
        {!isFreePlan && (
          <Button
            component={Link}
            href="/app/inbox"
            variant="light"
            rightSection={<IconArrowRight size={16} />}
            size="sm"
          >
            Go to Inbox
          </Button>
        )}
      </Group>

      {/* Quick Stats for Paid Users */}
      {!isFreePlan && (
        <SimpleGrid cols={{base: 1, sm: 2, lg: 4}} spacing="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder={false}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Mail Items
                </Text>
                <ThemeIcon size="md" radius="md" variant="light" color="blue">
                  <IconMail size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                0
              </Text>
              <Button
                component={Link}
                href="/app/inbox"
                variant="subtle"
                size="compact-xs"
                rightSection={<IconArrowRight size={12} />}
                style={{justifyContent: "flex-start", paddingLeft: 0}}
              >
                View Inbox
              </Button>
            </Stack>
          </Card>
          <Card shadow="sm" padding="lg" radius="md" withBorder={false}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Active Plan
                </Text>
                <ThemeIcon size="md" radius="md" variant="light" color="green">
                  <IconInbox size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                Basic
              </Text>
              <Button
                component={Link}
                href="/app/billing"
                variant="subtle"
                size="compact-xs"
                rightSection={<IconArrowRight size={12} />}
                style={{justifyContent: "flex-start", paddingLeft: 0}}
              >
                Manage
              </Button>
            </Stack>
          </Card>
          <ReferralStatsCard
            title="Total Referrals"
            value={referralData.totalReferrals}
            icon={IconUsers}
            color="blue"
          />
          <ReferralStatsCard
            title="Total Earnings"
            value={`₱${referralData.totalEarnings.toLocaleString()}`}
            icon={IconCash}
            color="yellow"
          />
        </SimpleGrid>
      )}

      {/* Referral Section */}
      <Stack gap="lg">
        {/* Show generate code card if user doesn't have a referral code */}
        {!referralData.referralCode ? (
          <Suspense fallback={<Skeleton height={300} radius="md" />}>
            <GenerateReferralCodeCard
              onCodeGenerated={handleCodeGenerated}
              planDataPromise={freePlanDataPromise}
            />
          </Suspense>
        ) : (
          <>
            <SimpleGrid cols={{base: 1, md: 2}} spacing="lg">
              <ReferralLinkCard
                referralCode={referralData.referralCode}
                referralLink={referralData.referralLink!}
                onCopy={handleCopyLink}
                copied={copied}
              />
              <SimpleGrid cols={{base: 1, sm: 2}} spacing="md">
                <ReferralStatsCard
                  title="Total Referrals"
                  value={referralData.totalReferrals}
                  icon={IconUsers}
                  color="blue"
                />
                <ReferralStatsCard
                  title="Active Subscribers"
                  value={referralData.activeReferrals}
                  icon={IconTrendingUp}
                  color="green"
                />
                <ReferralStatsCard
                  title="Total Earnings"
                  value={`₱${referralData.totalEarnings.toLocaleString()}`}
                  icon={IconCash}
                  color="yellow"
                />
                <ReferralStatsCard
                  title="Pending Earnings"
                  value={`₱${referralData.pendingEarnings.toLocaleString()}`}
                  icon={IconCash}
                  color="orange"
                />
              </SimpleGrid>
            </SimpleGrid>

            <ReferralTable referrals={referralData.referrals} />
          </>
        )}
      </Stack>

      {/* Free Plan Upgrade Prompt */}
      {isFreePlan && (
        <Card
          shadow="sm"
          padding="xl"
          radius="md"
          withBorder={false}
          style={{
            textAlign: "center",
            backgroundColor: "var(--mantine-color-blue-0)",
          }}
        >
          <Stack gap="md" align="center">
            <Title order={3} size="h4" fw={700}>
              Unlock Mail Services
            </Title>
            <Text size="sm" c="dimmed" maw={500}>
              Upgrade to a paid plan to access digital mailroom services,
              including scanning, forwarding, and shredding.
            </Text>
            <Button
              component={Link}
              href="/app/pricing"
              size="md"
              variant="filled"
              color="blue"
              rightSection={<IconArrowRight size={16} />}
            >
              View Plans
            </Button>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
