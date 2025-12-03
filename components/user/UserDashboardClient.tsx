"use client";

import {useState, use, Suspense} from "react";
import {useRouter} from "next/navigation";
import {
  Title,
  Text,
  Stack,
  SimpleGrid,
  Group,
  Button,
  ThemeIcon,
  Card,
  Skeleton,
  Alert,
  Badge,
} from "@mantine/core";
import {
  IconUsers,
  IconTrendingUp,
  IconCash,
  IconMail,
  IconInbox,
  IconArrowRight,
  IconGift,
  IconAlertCircle,
} from "@tabler/icons-react";
import {ReferralLinkCard} from "@/components/free/ReferralLinkCard";
import {ReferralStatsCard} from "@/components/free/ReferralStatsCard";
import {ReferralTable} from "@/components/free/ReferralTable";
import {GenerateReferralCodeCard} from "@/components/free/GenerateReferralCodeCard";
import Link from "next/link";

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

interface UserDashboardClientProps {
  planType: string;
  kycStatus: string;
  referralDataPromise: Promise<ReferralData | null>;
  freePlanDataPromise: Promise<{
    description: string | null;
    features: string[];
    not_included: string[];
    intended_for: string | null;
    cashback_percentage: number;
  } | null>;
}

export function UserDashboardClient({
  planType,
  kycStatus,
  referralDataPromise,
  freePlanDataPromise,
}: UserDashboardClientProps) {
  const referralData = use(referralDataPromise);
  const freePlanData = use(freePlanDataPromise);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const isFreePlan = planType === "FREE";
  const isKYCRequired =
    !isFreePlan && kycStatus !== "APPROVED" && kycStatus !== "PENDING";
  const isKYCPending = !isFreePlan && kycStatus === "PENDING";

  const cashbackPercentage = freePlanData?.cashback_percentage || 5;

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
      {/* KYC Required Alert */}
      {isKYCRequired && (
        <Alert
          variant="filled"
          color="orange"
          title="Verification Required"
          icon={<IconAlertCircle size={20} />}
        >
          <Group justify="space-between" align="center" gap="md">
            <Text size="sm" c="white">
              Your plan is active, but you need to complete identity
              verification to start using mailroom services.
            </Text>
            <Button
              component={Link}
              href="/app/kyc"
              variant="white"
              color="orange"
              size="xs"
            >
              Complete KYC
            </Button>
          </Group>
        </Alert>
      )}

      {/* KYC Pending Alert */}
      {isKYCPending && (
        <Alert
          variant="filled"
          color="blue"
          title="Verification Pending"
          icon={<IconAlertCircle size={20} />}
        >
          <Group justify="space-between" align="center" gap="md">
            <Text size="sm" c="white">
              Your identity verification is currently under review. You will be
              notified once it is approved.
            </Text>
            <Button
              component={Link}
              href="/app/kyc"
              variant="white"
              color="blue"
              size="xs"
            >
              View Status
            </Button>
          </Group>
        </Alert>
      )}

      {/* Header */}
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={4}>
          <Group gap="xs" align="center">
            <Title order={1} fw={800} size="h2">
              Dashboard
            </Title>
            {isFreePlan && (
              <Badge
                variant="light"
                color="blue"
                size="sm"
                leftSection={<IconGift size={12} />}
              >
                {cashbackPercentage}% Cashback
              </Badge>
            )}
          </Group>
          <Text c="dimmed" size="sm">
            {isFreePlan
              ? `Track referrals and earn ${cashbackPercentage}% on every subscription`
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

            <Stack gap="xs">
              <ReferralTable
                transactions={referralData.transactions.slice(0, 5)}
              />
              {referralData.transactions.length > 5 && (
                <Group justify="center">
                  <Button
                    component={Link}
                    href="/app/referrals"
                    variant="subtle"
                    size="sm"
                    rightSection={<IconArrowRight size={14} />}
                  >
                    View All History
                  </Button>
                </Group>
              )}
            </Stack>
          </>
        )}
      </Stack>

      {/* Free Plan Upgrade Prompt */}
      {isFreePlan && (
        <Card
          padding="xl"
          radius="lg"
          withBorder
          style={{
            textAlign: "center",
            backgroundColor: "var(--mantine-color-blue-0)",
            borderColor: "var(--mantine-color-blue-2)",
          }}
        >
          <Stack gap="md" align="center">
            <Title order={3} size="h4" fw={700}>
              Unlock Mail Services
            </Title>
            <Text size="sm" c="dimmed" maw={500} lh={1.5}>
              Upgrade to a paid plan to access digital mailroom services,
              including scanning, forwarding, and shredding.
            </Text>
            <Button
              component={Link}
              href="/app/pricing"
              size="md"
              variant="filled"
              color="blue"
              rightSection={<IconArrowRight size={18} />}
              mt="xs"
            >
              View Plans
            </Button>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
