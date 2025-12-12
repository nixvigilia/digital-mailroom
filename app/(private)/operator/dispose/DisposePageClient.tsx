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
  Table,
  Pagination,
  Modal,
  Textarea,
} from "@mantine/core";
import {
  IconTrash,
  IconCheck,
  IconAlertCircle,
  IconInbox,
} from "@tabler/icons-react";
import Link from "next/link";
import {notifications} from "@mantine/notifications";
import {processShred} from "@/app/actions/operator-mail";
import {useRouter} from "next/navigation";

interface DisposeRequest {
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

interface DisposePageClientProps {
  initialData: {
    requests: DisposeRequest[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export default function DisposePageClient({
  initialData,
}: DisposePageClientProps) {
  const router = useRouter();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);
  const [modalOpen, setModalOpen] = useState(false);

  const selectedRequest =
    initialData.requests.find((req) => req.id === selectedRequestId) || null;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    router.push(url.pathname + url.search);
  };

  const handleOpenModal = (requestId: string) => {
    setSelectedRequestId(requestId);
    setModalOpen(true);
  };

  const handleProcessDispose = async () => {
    if (!selectedRequest) {
      notifications.show({
        title: "Error",
        message: "Please select a request",
        color: "red",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("mailId", selectedRequest.mailItemId);
    if (notes) {
      formData.append("notes", notes);
    }

    try {
      const result = await processShred(formData);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        setModalOpen(false);
        setSelectedRequestId(null);
        setNotes("");
        router.refresh();
      } else {
        notifications.show({
          title: "Error",
          message: result.message,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error processing dispose:", error);
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
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
          <IconTrash size={32} color="var(--mantine-color-red-6)" />
          <Title
            order={1}
            fw={800}
            style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
          >
            Mail Disposal
          </Title>
        </Group>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Process mail disposal requests
        </Text>
      </Stack>

      {/* Dispose Queue Table */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconInbox size={24} />
              <Title order={2} size="h3">
                Disposal Queue ({initialData.totalCount})
              </Title>
            </Group>
          </Group>
          {initialData.requests.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No items in disposal queue.
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
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {initialData.requests.map((request) => (
                      <Table.Tr key={request.id}>
                        <Table.Td>
                          <Link
                            href={`/operator/queue/${request.mailItemId}`}
                            style={{textDecoration: "none"}}
                          >
                            <Text fw={500} size="sm" c="blue">
                              {request.mailItem.id}
                            </Text>
                          </Link>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text size="sm" fw={500}>
                              {request.user.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {request.user.email}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{request.mailItem.sender}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {new Date(request.requestedAt).toLocaleString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={statusColors[request.status] || "gray"}
                            variant="light"
                          >
                            {statusLabels[request.status] || request.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={request.kycApproved ? "green" : "red"}
                            variant="light"
                          >
                            {request.kycApproved ? "Approved" : "Not Approved"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Button
                            size="xs"
                            variant="light"
                            color="red"
                            leftSection={<IconCheck size={16} />}
                            onClick={() => handleOpenModal(request.id)}
                            disabled={
                              request.status !== "PENDING" &&
                              request.status !== "IN_PROGRESS"
                            }
                          >
                            Process Dispose
                          </Button>
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

      {/* Process Dispose Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRequestId(null);
          setNotes("");
        }}
        title="Process Dispose Request"
        size="lg"
      >
        <Stack gap="md">
          {selectedRequest && (
            <>
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                <Text size="sm" fw={600} mb={4}>
                  Warning: This action cannot be undone
                </Text>
                <Text size="xs" c="dimmed">
                  This action is permanent and cannot be undone. The physical
                  mail will be securely disposed and destroyed.
                </Text>
              </Alert>

              <Alert icon={<IconAlertCircle size={16} />} color="blue">
                <Text size="sm" fw={600} mb={4}>
                  Mail Item: {selectedRequest.mailItem.id}
                </Text>
                <Text size="xs" c="dimmed">
                  User: {selectedRequest.user.name} (
                  {selectedRequest.user.email})
                </Text>
                <Text size="xs" c="dimmed">
                  Sender: {selectedRequest.mailItem.sender}
                </Text>
                <Group gap="xs" align="center" mt={4}>
                  <Text size="xs" c="dimmed" component="span">
                    KYC Status:
                  </Text>
                  <Badge
                    size="xs"
                    color={selectedRequest.kycApproved ? "green" : "red"}
                    variant="light"
                  >
                    {selectedRequest.kycApproved ? "Approved" : "Not Approved"}
                  </Badge>
                </Group>
              </Alert>

              {/* <Textarea
                label="Notes (Optional)"
                placeholder="Any additional notes about the disposal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                minRows={3}
              /> */}

              <Group justify="flex-end" mt="md">
                <Button
                  variant="subtle"
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedRequestId(null);
                    setNotes("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcessDispose}
                  loading={loading}
                  color="red"
                  leftSection={<IconCheck size={18} />}
                >
                  Confirm Dispose
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
    </Stack>
  );
}
