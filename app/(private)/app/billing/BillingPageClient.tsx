"use client";

import {useState, useEffect} from "react";
import {useSearchParams, useRouter} from "next/navigation";
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
  ThemeIcon,
  Card,
} from "@mantine/core";
import {
  IconCreditCard,
  IconCalendar,
  IconDownload,
  IconPlus,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconArrowLeft,
} from "@tabler/icons-react";
import Link from "next/link";

interface BillingHistoryItem {
  id: string;
  date: string; // ISO string
  amount: number;
  status: string;
  description: string | null;
  external_id: string;
  invoice_url: string | null;
  payment_method: string | null;
  payment_channel: string | null;
  paid_at: string | null; // ISO string
}

interface SubscriptionData {
  plan: string;
  status: string;
  billingCycle: string;
  amount: number;
  nextBillingDate: string | null; // ISO string
  startDate: string | null; // ISO string
}

interface BillingPageClientProps {
  hasError?: boolean;
  hasSuccess?: boolean;
  billingHistory: BillingHistoryItem[];
  subscription: SubscriptionData;
}

export function BillingPageClient({
  hasError = false,
  hasSuccess = false,
  billingHistory = [],
  subscription,
}: BillingPageClientProps) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect to /app if error is present
  useEffect(() => {
    if (hasError) {
      const timeout = setTimeout(() => {
        router.push("/app");
      }, 5000); // Redirect after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [hasError, router]);

  // Clear success params from URL after displaying
  useEffect(() => {
    if (hasSuccess) {
      const timeout = setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete("success");
        const newUrl = newSearchParams.toString()
          ? `?${newSearchParams.toString()}`
          : "";
        router.replace(`/app/billing${newUrl}`, {scroll: false});
      }, 5000); // Clear after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [hasSuccess, router, searchParams]);

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

  const handleAddPaymentMethod = () => {
    setPaymentModalOpen(true);
  };

  const handleDownloadInvoice = (transactionId: string) => {
    // Open PDF download in new window
    window.open(`/api/invoices/${transactionId}`, "_blank");
  };

  // If error, show only error message and redirect
  if (hasError) {
    return (
      <Stack
        gap="xl"
        align="center"
        justify="center"
        style={{
          width: "100%",
          minHeight: "80vh",
          padding: "2rem",
        }}
      >
        <Card
          shadow="lg"
          padding="xl"
          radius="md"
          withBorder
          style={{
            width: "100%",
            borderColor: "var(--mantine-color-red-4)",
            backgroundColor: "var(--mantine-color-red-0)",
          }}
        >
          <Stack gap="md" align="center">
            <ThemeIcon size={80} radius="xl" variant="light" color="red">
              <IconX size={40} />
            </ThemeIcon>
            <Stack gap="xs" align="center">
              <Title order={2} size="h3" fw={700}>
                Payment Failed
              </Title>
              <Text c="dimmed" size="sm" ta="center" maw={500}>
                We encountered an issue processing your payment. Please check
                your payment method and try again.
              </Text>
            </Stack>
            <Group gap="md" mt="md">
              <Button
                component={Link}
                href="/app/pricing"
                variant="filled"
                color="red"
                leftSection={<IconArrowLeft size={18} />}
              >
                Try Again
              </Button>
              <Button variant="subtle" onClick={() => router.push("/app")}>
                Go to Dashboard
              </Button>
            </Group>
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="What went wrong?"
              color="red"
              variant="light"
              style={{width: "100%"}}
            >
              <Stack gap="xs">
                <Text size="sm">Common reasons for payment failures:</Text>
                <ul style={{margin: 0, paddingLeft: 20}}>
                  <li>
                    <Text size="sm">Insufficient funds in your account</Text>
                  </li>
                  <li>
                    <Text size="sm">Payment method declined by your bank</Text>
                  </li>
                  <li>
                    <Text size="sm">Expired or invalid payment method</Text>
                  </li>
                  <li>
                    <Text size="sm">
                      Network or connection issues during payment
                    </Text>
                  </li>
                </ul>
              </Stack>
            </Alert>
            <Text size="xs" c="dimmed" ta="center" mt="md">
              Redirecting to dashboard in 5 seconds...
            </Text>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      <Stack gap="xs">
        <Title
          order={1}
          fw={800}
          style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
        >
          Billing & Subscription
        </Title>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Manage your subscription and payment methods
        </Text>
        <Text c="dimmed" size="sm" hiddenFrom="sm">
          Manage your subscription and payment methods
        </Text>
      </Stack>

      {/* Success Alert */}
      {hasSuccess && (
        <Alert
          icon={<IconCheck size={18} />}
          title="Payment Successful!"
          color="green"
          variant="light"
          onClose={() => {
            const newSearchParams = new URLSearchParams(
              searchParams.toString()
            );
            newSearchParams.delete("success");
            const newUrl = newSearchParams.toString()
              ? `?${newSearchParams.toString()}`
              : "";
            router.replace(`/app/billing${newUrl}`, {scroll: false});
          }}
          withCloseButton
        >
          Your payment has been processed successfully. Your subscription is now
          active.
        </Alert>
      )}

      {/* Current Subscription */}
      <Paper
        withBorder
        p="xl"
        radius="md"
        style={{padding: "clamp(1rem, 4vw, 1.5rem)"}}
      >
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
              {subscription.amount > 0 && (
                <Text size="sm" c="dimmed">
                  ₱{subscription.amount.toLocaleString()} per{" "}
                  {subscription.billingCycle}
                </Text>
              )}
            </Stack>
            {subscription.status !== "inactive" && (
              <Button variant="outline" component={Link} href="/app/pricing">
                Change Plan
              </Button>
            )}
          </Group>
          <Divider />
          <Group gap="xl">
            {subscription.startDate && (
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Started
                </Text>
                <Text size="sm" fw={500}>
                  {new Date(subscription.startDate).toLocaleDateString()}
                </Text>
              </Stack>
            )}
            {subscription.nextBillingDate && (
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Next Billing Date
                </Text>
                <Text size="sm" fw={500}>
                  {new Date(subscription.nextBillingDate).toLocaleDateString()}
                </Text>
              </Stack>
            )}
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
      <Paper
        withBorder
        p="xl"
        radius="md"
        style={{padding: "clamp(1rem, 4vw, 1.5rem)"}}
      >
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
                <Group
                  key={method.id}
                  justify="space-between"
                  p="md"
                  style={{
                    border: "1px solid var(--mantine-color-gray-3)",
                    borderRadius: "var(--mantine-radius-md)",
                  }}
                >
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
      <Paper
        withBorder
        p="xl"
        radius="md"
        style={{padding: "clamp(1rem, 4vw, 1.5rem)"}}
      >
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
                      {new Date(invoice.date).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>₱{invoice.amount.toLocaleString()}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          invoice.status === "PAID"
                            ? "green"
                            : invoice.status === "PENDING"
                            ? "yellow"
                            : invoice.status === "FAILED"
                            ? "red"
                            : "gray"
                        }
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
                        disabled={invoice.status !== "PAID"}
                      >
                        Download PDF
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
