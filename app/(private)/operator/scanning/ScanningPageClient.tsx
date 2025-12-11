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
  Table,
  Pagination,
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
import {processOpenScan} from "@/app/actions/operator-mail";
import {useRouter} from "next/navigation";

interface ScanRequest {
  id: string;
  mailItemId: string;
  mailItem: {
    id: string;
    sender: string;
    subject: string | null;
    receivedAt: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    type: string;
  };
  status: string;
  requestedAt: string;
  kycApproved: boolean;
}

interface ScanningPageClientProps {
  initialData: {
    requests: ScanRequest[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export function ScanningPageClient({initialData}: ScanningPageClientProps) {
  const router = useRouter();
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [selectedMailItem, setSelectedMailItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);

  const handleQuickScan = async () => {
    if (!selectedMailItem || !scanFile) {
      notifications.show({
        title: "Error",
        message: "Please select a mail item and upload a scanned document",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("mailId", selectedMailItem);
      formData.append("file", scanFile);

      const result = await processOpenScan(formData);

      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        setScanFile(null);
        setSelectedMailItem(null);
        router.refresh();
      } else {
        notifications.show({
          title: "Error",
          message: result.message,
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    router.push(url.pathname + url.search);
  };

  const statusColors: Record<string, string> = {
    PENDING: "yellow",
    IN_PROGRESS: "blue",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
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
            Select a mail item from the queue and upload the scanned document.
          </Alert>
          <Group gap="md" align="flex-end">
            <Select
              label="Select Mail Item"
              placeholder="Choose from queue"
              data={initialData.requests.map((item) => ({
                value: item.mailItemId,
                label: `${item.mailItem.id} - ${item.user.name}`,
              }))}
              value={selectedMailItem}
              onChange={setSelectedMailItem}
              style={{flex: 1}}
              searchable
            />
            <FileButton
              onChange={setScanFile}
              accept="image/*,application/pdf"
            >
              {(props) => (
                <Button
                  {...props}
                  leftSection={<IconUpload size={18} />}
                  variant="outline"
                >
                  {scanFile ? scanFile.name : "Upload Scan"}
                </Button>
              )}
            </FileButton>
            <Button
              onClick={handleQuickScan}
              disabled={!selectedMailItem || !scanFile || loading}
              leftSection={<IconCheck size={18} />}
              loading={loading}
            >
              Upload & Complete
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Scan Queue Table */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconInbox size={24} />
              <Title order={2} size="h3">
                Scanning Queue ({initialData.totalCount})
              </Title>
            </Group>
          </Group>

          {initialData.requests.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No items in scanning queue.
            </Text>
          ) : (
            <>
              <Table.ScrollContainer minWidth={800}>
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Mail Item ID</Table.Th>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Sender</Table.Th>
                      <Table.Th>Requested At</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>KYC Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {initialData.requests.map((item) => (
                      <Table.Tr key={item.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {item.mailItem.id}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text size="sm" fw={500}>
                              {item.user.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {item.user.email}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{item.mailItem.sender}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {new Date(item.requestedAt).toLocaleString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={statusColors[item.status] || "gray"}
                            variant="light"
                          >
                            {statusLabels[item.status] || item.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={item.kycApproved ? "green" : "red"}
                            variant="light"
                          >
                            {item.kycApproved ? "Approved" : "Not Approved"}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>

              {initialData.totalPages > 1 && (
                <Group justify="center" mt="md">
                  <Pagination
                    value={currentPage}
                    onChange={handlePageChange}
                    total={initialData.totalPages}
                    size="sm"
                  />
                </Group>
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

