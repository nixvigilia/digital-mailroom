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
  SimpleGrid,
  Card,
  Modal,
} from "@mantine/core";
import {
  IconTrash,
  IconAlertCircle,
  IconInbox,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import {notifications} from "@mantine/notifications";

// Mock shredding queue - will be replaced with backend
const mockShredQueue = [
  {
    id: "mail-126",
    userName: "Sarah Lee",
    requestedAt: new Date("2025-01-15T11:00:00"),
    priority: "low",
    kycApproved: true,
  },
];

export default function ShreddingPage() {
  const [shredQueue] = useState(mockShredQueue);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleShred = (itemId: string) => {
    setSelectedItem(itemId);
    setConfirmModalOpen(true);
  };

  const confirmShred = () => {
    if (!selectedItem) return;

    // TODO: Implement actual shred processing
    notifications.show({
      title: "Success",
      message: "Mail shredded successfully",
      color: "green",
    });
    setConfirmModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group gap="md" align="center">
          <IconTrash size={32} color="var(--mantine-color-red-6)" />
          <Title
            order={1}
            fw={800}
            style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
          >
            Mail Shredding
          </Title>
        </Group>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Process mail shredding requests
        </Text>
      </Stack>

      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Warning">
        Shredding is a permanent action that cannot be undone. Please verify KYC/KYB
        approval and user consent before proceeding.
      </Alert>

      {/* Shred Queue */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconInbox size={24} />
              <Title order={2} size="h3">
                Shredding Queue ({shredQueue.length})
              </Title>
            </Group>
            <Button
              component={Link}
              href="/operator/queue?action=shred"
              variant="subtle"
              size="sm"
            >
              View All
            </Button>
          </Group>
          {shredQueue.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No items in shredding queue.
            </Text>
          ) : (
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="md">
              {shredQueue.map((item) => (
                <Card key={item.id} withBorder p="md" radius="md">
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="sm">
                        {item.id}
                      </Text>
                      <Badge color="gray" variant="light" size="sm">
                        {item.priority}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {item.userName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Requested: {item.requestedAt.toLocaleString()}
                    </Text>
                    <Group justify="space-between" mt="xs">
                      {item.kycApproved ? (
                        <Badge color="green" variant="light" size="xs">
                          KYC Approved
                        </Badge>
                      ) : (
                        <Badge color="red" variant="light" size="xs">
                          KYC Not Approved
                        </Badge>
                      )}
                      <Group gap="xs">
                        <Button
                          component={Link}
                          href={`/operator/queue/${item.id}`}
                          variant="subtle"
                          size="xs"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleShred(item.id)}
                          disabled={!item.kycApproved}
                          color="red"
                          size="xs"
                          leftSection={<IconTrash size={14} />}
                        >
                          Shred
                        </Button>
                      </Group>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Paper>

      {/* Confirmation Modal */}
      <Modal
        opened={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedItem(null);
        }}
        title="Confirm Shredding"
        size="md"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Text fw={600} mb="xs">
              This action cannot be undone!
            </Text>
            Are you sure you want to shred this mail item? This will permanently destroy
            the physical mail.
          </Alert>
          <Group justify="flex-end" gap="md">
            <Button
              variant="subtle"
              onClick={() => {
                setConfirmModalOpen(false);
                setSelectedItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={18} />}
              onClick={confirmShred}
            >
              Confirm Shred
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

