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
  FileButton,
  SimpleGrid,
  Card,
  Select,
} from "@mantine/core";
import {
  IconScan,
  IconUpload,
  IconCheck,
  IconAlertCircle,
  IconInbox,
} from "@tabler/icons-react";
import Link from "next/link";
import {notifications} from "@mantine/notifications";

// Mock scanning queue - will be replaced with backend
const mockScanQueue = [
  {
    id: "mail-123",
    userName: "John Doe",
    requestedAt: new Date("2025-01-15T08:00:00"),
    priority: "high",
    kycApproved: true,
  },
  {
    id: "mail-124",
    userName: "Jane Smith",
    requestedAt: new Date("2025-01-15T09:15:00"),
    priority: "medium",
    kycApproved: true,
  },
];

export default function ScanningPage() {
  const [scanQueue] = useState(mockScanQueue);
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [selectedMailItem, setSelectedMailItem] = useState<string | null>(null);

  const handleQuickScan = () => {
    if (!selectedMailItem || !scanFile) {
      notifications.show({
        title: "Error",
        message: "Please select a mail item and upload a scanned document",
        color: "red",
      });
      return;
    }

    // TODO: Implement quick scan upload
    notifications.show({
      title: "Success",
      message: "Document scanned and uploaded successfully",
      color: "green",
    });
    setScanFile(null);
    setSelectedMailItem(null);
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group gap="md" align="center">
          <IconScan size={32} color="var(--mantine-color-blue-6)" />
          <Title
            order={1}
            fw={800}
            style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
          >
            Document Scanning
          </Title>
        </Group>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Upload scanned documents for mail items
        </Text>
      </Stack>

      {/* Quick Scan Section */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group gap="sm">
            <IconScan size={24} />
            <Title order={2} size="h3">
              Quick Scan Upload
            </Title>
          </Group>
          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            Select a mail item from the queue and upload the scanned document. For detailed
            processing, use the Action Queue.
          </Alert>
          <Group gap="md" align="flex-end">
            <Select
              label="Select Mail Item"
              placeholder="Choose from queue"
              data={scanQueue.map((item) => ({
                value: item.id,
                label: `${item.id} - ${item.userName}`,
              }))}
              value={selectedMailItem}
              onChange={setSelectedMailItem}
              style={{flex: 1}}
            />
            <FileButton onChange={setScanFile} accept="image/*,application/pdf">
              {(props) => (
                <Button {...props} leftSection={<IconUpload size={18} />} variant="outline">
                  {scanFile ? scanFile.name : "Upload Scan"}
                </Button>
              )}
            </FileButton>
            <Button
              onClick={handleQuickScan}
              disabled={!selectedMailItem || !scanFile}
              leftSection={<IconCheck size={18} />}
            >
              Upload & Complete
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Scan Queue */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconInbox size={24} />
              <Title order={2} size="h3">
                Scanning Queue ({scanQueue.length})
              </Title>
            </Group>
            <Button
              component={Link}
              href="/operator/queue?action=scan"
              variant="subtle"
              size="sm"
            >
              View All
            </Button>
          </Group>
          {scanQueue.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No items in scanning queue.
            </Text>
          ) : (
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="md">
              {scanQueue.map((item) => (
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
                      <Badge
                        color={item.priority === "high" ? "red" : "yellow"}
                        variant="light"
                        size="sm"
                      >
                        {item.priority}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {item.userName}
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

