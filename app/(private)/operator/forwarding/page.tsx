"use client";

import {useState} from "react";
import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  Badge,
  Alert,
  TextInput,
  Textarea,
  SimpleGrid,
  Card,
  Select,
} from "@mantine/core";
import {
  IconTruck,
  IconCheck,
  IconAlertCircle,
  IconInbox,
} from "@tabler/icons-react";
import Link from "next/link";
import {notifications} from "@mantine/notifications";

// Mock forwarding queue - will be replaced with backend
const mockForwardQueue = [
  {
    id: "mail-125",
    userName: "Mike Johnson",
    requestedAt: new Date("2025-01-15T10:30:00"),
    priority: "medium",
    kycApproved: true,
    forwardingAddress: "123 Main St, Manila, Philippines",
  },
];

export default function ForwardingPage() {
  const [forwardQueue] = useState(mockForwardQueue);
  const [selectedMailItem, setSelectedMailItem] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleQuickForward = () => {
    if (!selectedMailItem || !trackingNumber) {
      notifications.show({
        title: "Error",
        message: "Please select a mail item and enter tracking number",
        color: "red",
      });
      return;
    }

    // TODO: Implement quick forward processing
    notifications.show({
      title: "Success",
      message: "Mail forwarded successfully",
      color: "green",
    });
    setTrackingNumber("");
    setSelectedMailItem(null);
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group gap="md" align="center">
          <IconTruck size={32} color="var(--mantine-color-blue-6)" />
          <Title
            order={1}
            fw={800}
            style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
          >
            Mail Forwarding
          </Title>
        </Group>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Process mail forwarding requests
        </Text>
      </Stack>

      {/* Quick Forward Section */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group gap="sm">
            <IconTruck size={24} />
            <Title order={2} size="h3">
              Quick Forward Processing
            </Title>
          </Group>
          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            Select a mail item from the queue and enter tracking information. For detailed
            processing, use the Action Queue.
          </Alert>
          <Select
            label="Select Mail Item"
            placeholder="Choose from queue"
            data={forwardQueue.map((item) => ({
              value: item.id,
              label: `${item.id} - ${item.userName}`,
            }))}
            value={selectedMailItem}
            onChange={setSelectedMailItem}
          />
          {selectedMailItem && (
            <Textarea
              label="Forwarding Address"
              value={
                forwardQueue.find((item) => item.id === selectedMailItem)?.forwardingAddress || ""
              }
              disabled
              minRows={2}
            />
          )}
          <TextInput
            label="Tracking Number"
            placeholder="Enter tracking number"
            required
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <Button
            onClick={handleQuickForward}
            disabled={!selectedMailItem || !trackingNumber}
            leftSection={<IconCheck size={18} />}
            fullWidth
          >
            Complete Forward & Update Status
          </Button>
        </Stack>
      </Paper>

      {/* Forward Queue */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconInbox size={24} />
              <Title order={2} size="h3">
                Forwarding Queue ({forwardQueue.length})
              </Title>
            </Group>
            <Button
              component={Link}
              href="/operator/queue?action=forward"
              variant="subtle"
              size="sm"
            >
              View All
            </Button>
          </Group>
          {forwardQueue.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No items in forwarding queue.
            </Text>
          ) : (
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="md">
              {forwardQueue.map((item) => (
                <Card
                  key={item.id}
                  withBorder
                  p="md"
                  radius="md"
                  component={Link}
                  href={`/operator/queue/${item.id}`}
                  style={{cursor: "pointer"}}
                >
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="sm">
                        {item.id}
                      </Text>
                      <Badge color="yellow" variant="light" size="sm">
                        {item.priority}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {item.userName}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {item.forwardingAddress}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Requested: {item.requestedAt.toLocaleString()}
                    </Text>
                    {item.kycApproved ? (
                      <Badge color="green" variant="light" size="xs">
                        KYC Approved
                      </Badge>
                    ) : (
                      <Badge color="red" variant="light" size="xs">
                        KYC Not Approved
                      </Badge>
                    )}
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

