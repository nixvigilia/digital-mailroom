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
import {IconUsers, IconHistory, IconCurrencyPeso} from "@tabler/icons-react";

interface Transaction {
  id: string;
  email: string;
  amount: number;
  status: string;
  date: Date;
  plan: string;
}

interface ReferralTableProps {
  transactions: Transaction[];
}

export function ReferralTable({transactions}: ReferralTableProps) {
  if (transactions.length === 0) {
    return (
      <Card shadow="sm" padding="xl" radius="md" withBorder={false}>
        <Stack gap="md" align="center" py="lg">
          <ThemeIcon variant="light" color="gray" size={60} radius="full">
            <IconUsers size={30} />
          </ThemeIcon>
          <Stack gap="xs" align="center">
            <Text size="lg" fw={600}>
              No Referral Transactions Yet
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={300}>
              Start sharing your secure link to earn rewards. Your commissions
              will appear here.
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
            Referral Transactions
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
                  DATE
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
                  AMOUNT
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {transactions.map((tx) => (
                <Table.Tr key={tx.id} style={{fontSize: "0.9rem"}}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" radius="xl" color="blue">
                        {tx.email.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Text size="sm" fw={500}>
                        {tx.email}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="gray" size="sm" radius="sm">
                      {tx.plan}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(tx.date).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={tx.status === "paid" ? "green" : "yellow"}
                      variant="dot"
                      size="sm"
                    >
                      {tx.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{textAlign: "right"}}>
                    <Text
                      size="sm"
                      fw={600}
                      c={tx.status === "paid" ? "green" : "dimmed"}
                    >
                      ₱{tx.amount.toLocaleString()}
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
