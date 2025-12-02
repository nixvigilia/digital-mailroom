"use client";

import {useState, useEffect} from "react";
import {createClient} from "@/utils/supabase/client";
import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  Divider,
  Badge,
  Table,
  Alert,
  Modal,
  TextInput,
  Select,
} from "@mantine/core";
import {
  IconCreditCard,
  IconCheck,
  IconX,
  IconCalendar,
  IconDownload,
  IconPlus,
} from "@tabler/icons-react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const supabase = createClient();

  // Mock data - will be replaced with backend integration
  const [subscription] = useState({
    plan: "Individual",
    status: "active",
    billingCycle: "monthly",
    amount: 299,
    nextBillingDate: new Date("2025-02-15"),
    startDate: new Date("2024-01-15"),
  });

  const [paymentMethods] = useState([
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
  ]);

  const [billingHistory] = useState([
    {
      id: "1",
      date: new Date("2025-01-15"),
      amount: 299,
      status: "paid",
      invoiceUrl: "#",
    },
    {
      id: "2",
      date: new Date("2024-12-15"),
      amount: 299,
      status: "paid",
      invoiceUrl: "#",
    },
    {
      id: "3",
      date: new Date("2024-11-15"),
      amount: 299,
      status: "paid",
      invoiceUrl: "#",
    },
  ]);

  const handleAddPaymentMethod = () => {
    setPaymentModalOpen(true);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement invoice download
    console.log("Downloading invoice:", invoiceId);
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      <Stack gap="xs">
        <Title order={1} fw={800} style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}>
          Billing & Subscription
        </Title>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Manage your subscription and payment methods
        </Text>
        <Text c="dimmed" size="sm" hiddenFrom="sm">
          Manage your subscription and payment methods
        </Text>
      </Stack>

      {/* Current Subscription */}
      <Paper withBorder p="xl" radius="md" style={{padding: "clamp(1rem, 4vw, 1.5rem)"}}>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Group gap="md" align="center">
                <Title order={2} size="h3">
                  Current Plan
                </Title>
                <Badge color="green" variant="light" size="lg">
                  {subscription.status}
                </Badge>
              </Group>
              <Text size="lg" fw={600}>
                {subscription.plan} Plan
              </Text>
              <Text size="sm" c="dimmed">
                ₱{subscription.amount.toLocaleString()} per {subscription.billingCycle}
              </Text>
            </Stack>
            <Button variant="outline">Change Plan</Button>
          </Group>
          <Divider />
          <Group gap="xl">
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Started
              </Text>
              <Text size="sm" fw={500}>
                {subscription.startDate.toLocaleDateString()}
              </Text>
            </Stack>
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Next Billing Date
              </Text>
              <Text size="sm" fw={500}>
                {subscription.nextBillingDate.toLocaleDateString()}
              </Text>
            </Stack>
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Billing Cycle
              </Text>
              <Text size="sm" fw={500} tt="capitalize">
                {subscription.billingCycle}
              </Text>
            </Stack>
          </Group>
        </Stack>
      </Paper>

      {/* Payment Methods */}
      <Paper withBorder p="xl" radius="md" style={{padding: "clamp(1rem, 4vw, 1.5rem)"}}>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconCreditCard size={24} />
              <Title order={2} size="h3">
                Payment Methods
              </Title>
            </Group>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleAddPaymentMethod}
            >
              Add Payment Method
            </Button>
          </Group>
          <Divider />
          {paymentMethods.length === 0 ? (
            <Text c="dimmed" ta="center" py="md">
              No payment methods on file
            </Text>
          ) : (
            <Stack gap="md">
              {paymentMethods.map((method) => (
                <Group key={method.id} justify="space-between" p="md" style={{border: "1px solid var(--mantine-color-gray-3)", borderRadius: "var(--mantine-radius-md)"}}>
                  <Group gap="md">
                    <IconCreditCard size={24} />
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Text fw={500}>
                          {method.brand} •••• {method.last4}
                        </Text>
                        {method.isDefault && (
                          <Badge size="sm" variant="light" color="blue">
                            Default
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </Text>
                    </Stack>
                  </Group>
                  <Group gap="xs">
                    {!method.isDefault && (
                      <Button variant="subtle" size="xs">
                        Set as Default
                      </Button>
                    )}
                    <Button variant="subtle" size="xs" color="red">
                      Remove
                    </Button>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Billing History */}
      <Paper withBorder p="xl" radius="md" style={{padding: "clamp(1rem, 4vw, 1.5rem)"}}>
        <Stack gap="md">
          <Group gap="sm">
            <IconCalendar size={24} />
            <Title order={2} size="h3">
              Billing History
            </Title>
          </Group>
          <Divider />
          {billingHistory.length === 0 ? (
            <Text c="dimmed" ta="center" py="md">
              No billing history
            </Text>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Invoice</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {billingHistory.map((invoice) => (
                  <Table.Tr key={invoice.id}>
                    <Table.Td>
                      {invoice.date.toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>₱{invoice.amount.toLocaleString()}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={invoice.status === "paid" ? "green" : "red"}
                        variant="light"
                      >
                        {invoice.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="subtle"
                        size="xs"
                        leftSection={<IconDownload size={14} />}
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        Download
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {/* Add Payment Method Modal */}
      <Modal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Add Payment Method"
        size="lg"
      >
        <Stack gap="md">
          <Alert color="blue">
            Payment method integration will be implemented with your payment
            provider (Stripe, etc.)
          </Alert>
          <TextInput label="Card Number" placeholder="1234 5678 9012 3456" />
          <Group grow>
            <TextInput label="Expiry Month" placeholder="MM" />
            <TextInput label="Expiry Year" placeholder="YYYY" />
            <TextInput label="CVC" placeholder="123" />
          </Group>
          <TextInput label="Cardholder Name" placeholder="John Doe" />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setPaymentModalOpen(false)}>
              Add Payment Method
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

