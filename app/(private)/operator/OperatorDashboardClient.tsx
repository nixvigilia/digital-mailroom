"use client";

import {
  Title,
  Text,
  Stack,
  Group,
  Paper,
  SimpleGrid,
  Badge,
  Button,
} from "@mantine/core";
import {
  IconInbox,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconUserCheck,
  IconFileText,
  IconBox,
} from "@tabler/icons-react";
import Link from "next/link";

interface QueueStats {
  pending: number;
  inProgress: number;
  completed: number;
  requiresApproval: number;
  pendingKYC: number;
}

interface RecentAction {
  id: string;
  type: "scan" | "forward" | "shred";
  mailItemId: string;
  user: string;
  status: "pending" | "in_progress" | "completed" | "requires_approval";
  completedAt: Date | null;
  startedAt: Date | null;
  requestedAt: Date;
}

interface RecentKYCRequest {
  id: string;
  profileId: string;
  userName: string;
  email: string;
  userType: string;
  submittedAt: Date | null;
  status: string;
}

interface OperatorDashboardClientProps {
  queueStats: QueueStats;
  recentActions: RecentAction[];
  recentKYCRequests: RecentKYCRequest[];
}

export default function OperatorDashboardClient({
  queueStats,
  recentActions,
  recentKYCRequests,
}: OperatorDashboardClientProps) {
  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group gap="md" align="center">
          <IconInbox size={32} color="var(--mantine-color-blue-6)" />
          <Title
            order={1}
            fw={800}
            style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
          >
            Mailroom Operator Dashboard
          </Title>
        </Group>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Manage mail processing and action requests
        </Text>
        <Text c="dimmed" size="sm" hiddenFrom="sm">
          Manage mail processing and action requests
        </Text>
      </Stack>

      {/* Statistics Cards */}
      <SimpleGrid cols={{base: 2, sm: 5}} spacing="md">
        <Paper withBorder p="md" radius="md">
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <IconClock size={20} color="var(--mantine-color-yellow-6)" />
              <Text size="sm" c="dimmed" fw={500}>
                Pending
              </Text>
            </Group>
            <Text size="xl" fw={700}>
              {queueStats.pending}
            </Text>
          </Stack>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <IconInbox size={20} color="var(--mantine-color-blue-6)" />
              <Text size="sm" c="dimmed" fw={500}>
                In Progress
              </Text>
            </Group>
            <Text size="xl" fw={700} c="blue">
              {queueStats.inProgress}
            </Text>
          </Stack>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <IconCheck size={20} color="var(--mantine-color-green-6)" />
              <Text size="sm" c="dimmed" fw={500}>
                Completed
              </Text>
            </Group>
            <Text size="xl" fw={700} c="green">
              {queueStats.completed}
            </Text>
          </Stack>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <IconAlertCircle
                size={20}
                color="var(--mantine-color-orange-6)"
              />
              <Text size="sm" c="dimmed" fw={500}>
                Needs Approval
              </Text>
            </Group>
            <Text size="xl" fw={700} c="orange">
              {queueStats.requiresApproval}
            </Text>
          </Stack>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <IconUserCheck
                size={20}
                color="var(--mantine-color-purple-6)"
              />
              <Text size="sm" c="dimmed" fw={500}>
                Pending KYC/KYB
              </Text>
            </Group>
            <Text size="xl" fw={700} c="purple">
              {queueStats.pendingKYC}
            </Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* Quick Actions */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group gap="sm">
            <IconInbox size={24} />
            <Title order={2} size="h3">
              Quick Actions
            </Title>
          </Group>
          <SimpleGrid cols={{base: 1, sm: 3}} spacing="md">
            <Button
              component={Link}
              href="/operator/approvals"
              leftSection={<IconUserCheck size={18} />}
              variant="light"
              size="lg"
              fullWidth
            >
              Review KYC/KYB
            </Button>
            <Button
              component={Link}
              href="/operator/scanning"
              leftSection={<IconFileText size={18} />}
              variant="light"
              size="lg"
              fullWidth
            >
              Start Scanning
            </Button>
            <Button
              component={Link}
              href="/operator/forwarding"
              leftSection={<IconTruck size={18} />}
              variant="light"
              size="lg"
              fullWidth
            >
              Process Forwarding
            </Button>
            <Button
              component={Link}
              href="/operator/lockers"
              leftSection={<IconInbox size={18} />}
              variant="light"
              size="lg"
              fullWidth
            >
              Manage Lockers
            </Button>
            <Button
              component={Link}
              href="/operator/parcel-check"
              leftSection={<IconBox size={18} />}
              variant="light"
              size="lg"
              fullWidth
            >
              Parcel Fit Check
            </Button>
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* Recent Actions and KYC Requests */}
      <SimpleGrid cols={{base: 1, lg: 2}} spacing="md">
        {/* Recent Actions */}
        <Paper withBorder p="xl" radius="md">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <IconClock size={24} />
                <Title order={2} size="h3">
                  Recent Actions
                </Title>
              </Group>
            </Group>
            <Stack gap="sm">
              {recentActions.length === 0 ? (
                <Text c="dimmed" size="sm" ta="center" py="md">
                  No recent actions
                </Text>
              ) : (
                recentActions.map((action) => (
                  <Paper
                    key={action.id}
                    withBorder
                    p="md"
                    radius="md"
                  >
                    <Group justify="space-between" align="center">
                      <Stack gap={4}>
                        <Group gap="xs">
                          <Badge
                            color={
                              action.status === "completed"
                                ? "green"
                                : action.status === "in_progress"
                                ? "blue"
                                : "yellow"
                            }
                            variant="light"
                          >
                            {action.type}
                          </Badge>
                          <Text size="sm" fw={500}>
                            {action.user}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                          Mail Item: {action.mailItemId}
                        </Text>
                      </Stack>
                      <Text size="xs" c="dimmed">
                        {action.completedAt
                          ? new Date(action.completedAt).toLocaleString()
                          : action.startedAt
                          ? new Date(action.startedAt).toLocaleString()
                          : new Date(action.requestedAt).toLocaleString()}
                      </Text>
                    </Group>
                  </Paper>
                ))
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* Recent KYC/KYB Requests */}
        <Paper withBorder p="xl" radius="md">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <IconUserCheck size={24} />
                <Title order={2} size="h3">
                  Pending KYC/KYB
                </Title>
              </Group>
              <Button
                component={Link}
                href="/operator/approvals"
                variant="subtle"
                size="sm"
              >
                View All
              </Button>
            </Group>
            <Stack gap="sm">
              {recentKYCRequests.length === 0 ? (
                <Text c="dimmed" size="sm" ta="center" py="md">
                  No pending verification requests
                </Text>
              ) : (
                recentKYCRequests.map((kyc) => (
                  <Paper
                    key={kyc.id}
                    withBorder
                    p="md"
                    radius="md"
                    style={{cursor: "pointer"}}
                    component={Link}
                    href={`/operator/approvals`}
                  >
                    <Group justify="space-between" align="center">
                      <Stack gap={4}>
                        <Group gap="xs">
                          <Badge
                            color={
                              kyc.userType === "BUSINESS" ? "blue" : "green"
                            }
                            variant="light"
                          >
                            {kyc.userType === "BUSINESS" ? "KYB" : "KYC"}
                          </Badge>
                          <Text size="sm" fw={500}>
                            {kyc.userName}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {kyc.email}
                        </Text>
                      </Stack>
                      <Text size="xs" c="dimmed">
                        {kyc.submittedAt
                          ? new Date(kyc.submittedAt).toLocaleString()
                          : "Pending"}
                      </Text>
                    </Group>
                  </Paper>
                ))
              )}
            </Stack>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}

