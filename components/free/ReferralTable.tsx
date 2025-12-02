"use client";

import {
  Card,
  Table,
  Text,
  Badge,
  Stack,
  Group,
  Title,
  Avatar,
  ThemeIcon,
} from "@mantine/core";
import {IconUsers, IconHistory} from "@tabler/icons-react";

interface Referral {
  id: string;
  email: string;
  planType: string;
  joinedAt: Date;
  status: "active" | "pending";
  earnings: number;
}

interface ReferralTableProps {
  referrals: Referral[];
}

export function ReferralTable({referrals}: ReferralTableProps) {
  if (referrals.length === 0) {
    return (
      <Card shadow="sm" padding="xl" radius="md" withBorder={false}>
        <Stack gap="md" align="center" py="lg">
          <ThemeIcon variant="light" color="gray" size={60} radius="full">
            <IconUsers size={30} />
          </ThemeIcon>
          <Stack gap="xs" align="center">
            <Text size="lg" fw={600}>
              No Referrals Yet
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={300}>
              Start sharing your secure link to earn rewards. Your network will
              appear here.
            </Text>
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder={false}>
      <Stack gap="lg">
        <Group gap="sm">
          <ThemeIcon variant="light" color="blue" size="md" radius="sm">
            <IconHistory size={16} />
          </ThemeIcon>
          <Title order={3} size="h4" fw={700}>
            Referral History
          </Title>
        </Group>

        <Table.ScrollContainer minWidth={600}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th
                  style={{
                    color: "var(--mantine-color-dimmed)",
                    fontWeight: 600,
                  }}
                >
                  USER
                </Table.Th>
                <Table.Th
                  style={{
                    color: "var(--mantine-color-dimmed)",
                    fontWeight: 600,
                  }}
                >
                  PLAN
                </Table.Th>
                <Table.Th
                  style={{
                    color: "var(--mantine-color-dimmed)",
                    fontWeight: 600,
                  }}
                >
                  JOINED
                </Table.Th>
                <Table.Th
                  style={{
                    color: "var(--mantine-color-dimmed)",
                    fontWeight: 600,
                  }}
                >
                  STATUS
                </Table.Th>
                <Table.Th
                  style={{
                    textAlign: "right",
                    color: "var(--mantine-color-dimmed)",
                    fontWeight: 600,
                  }}
                >
                  EARNINGS
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {referrals.map((referral) => (
                <Table.Tr key={referral.id} style={{fontSize: "0.9rem"}}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" radius="xl" color="blue">
                        {referral.email.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Text size="sm" fw={500}>
                        {referral.email}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="gray" size="sm" radius="sm">
                      {referral.planType}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(referral.joinedAt).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={referral.status === "active" ? "green" : "yellow"}
                      variant="dot"
                      size="sm"
                    >
                      {referral.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{textAlign: "right"}}>
                    <Text
                      size="sm"
                      fw={600}
                      c={referral.earnings > 0 ? "green" : "dimmed"}
                    >
                      ₱{referral.earnings.toLocaleString()}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Stack>
    </Card>
  );
}
