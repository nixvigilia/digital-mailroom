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
  Table,
  Pagination,
  Modal,
  Select,
} from "@mantine/core";
import {
  IconTruck,
  IconCheck,
  IconAlertCircle,
  IconInbox,
  IconExternalLink,
} from "@tabler/icons-react";
import Link from "next/link";
import {notifications} from "@mantine/notifications";
import {processForward} from "@/app/actions/operator-mail";
import {useRouter} from "next/navigation";

interface ForwardRequest {
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
  forwardAddress: string;
  kycApproved: boolean;
}

interface ForwardingPageClientProps {
  initialData: {
    requests: ForwardRequest[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export default function ForwardingPageClient({
  initialData,
}: ForwardingPageClientProps) {
  const router = useRouter();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [threePLName, setThreePLName] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);
  const [modalOpen, setModalOpen] = useState(false);

  const common3PLProviders = [
    {value: "LBC Express", label: "LBC Express"},
    {value: "J&T Express", label: "J&T Express"},
    {value: "2GO Express", label: "2GO Express"},
    {value: "Flash Express", label: "Flash Express"},
    {value: "Ninja Van", label: "Ninja Van"},
    {value: "Grab Express", label: "Grab Express"},
    {value: "Lalamove", label: "Lalamove"},
    {value: "GoGo Express", label: "GoGo Express"},
    {value: "XDE Logistics", label: "XDE Logistics"},
    {value: "Entrego", label: "Entrego"},
    {value: "Other", label: "Other"},
  ];
  
  const selectedRequest = initialData.requests.find(
    (req) => req.id === selectedRequestId
  ) || null;

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

  const handleProcessForward = async () => {
    if (!selectedRequest || !trackingNumber) {
      notifications.show({
        title: "Error",
        message: "Please enter a tracking number",
        color: "red",
      });
      return;
    }

    if (!threePLName) {
      notifications.show({
        title: "Error",
        message: "Please select a 3PL provider",
        color: "red",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("mailId", selectedRequest.mailItemId);
    formData.append("forwardingAddress", selectedRequest.forwardAddress);
    formData.append("trackingNumber", trackingNumber);
    formData.append("threePLName", threePLName);
    if (trackingUrl) {
      formData.append("trackingUrl", trackingUrl);
    }
    if (notes) {
      formData.append("notes", notes);
    }

    try {
      const result = await processForward(formData);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        setModalOpen(false);
        setSelectedRequestId(null);
        setThreePLName(null);
        setTrackingNumber("");
        setTrackingUrl("");
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
      console.error("Error processing forward:", error);
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

      {/* Forward Queue Table */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconInbox size={24} />
              <Title order={2} size="h3">
                Forwarding Queue ({initialData.totalCount})
              </Title>
            </Group>
          </Group>
          {initialData.requests.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No items in forwarding queue.
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
                      <Table.Th>Forwarding Address</Table.Th>
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
                          <Text fw={500} size="sm">
                            {request.mailItem.id}
                          </Text>
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
                          <Text size="sm" lineClamp={2} style={{maxWidth: 200}}>
                            {request.forwardAddress}
                          </Text>
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
                            leftSection={<IconCheck size={16} />}
                            onClick={() => handleOpenModal(request.id)}
                            disabled={request.status !== "PENDING" && request.status !== "IN_PROGRESS"}
                          >
                            Process Forward
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

      {/* Process Forward Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRequestId(null);
          setThreePLName(null);
          setTrackingNumber("");
          setTrackingUrl("");
          setNotes("");
        }}
        title="Process Forward Request"
        size="lg"
      >
        <Stack gap="md">
          {selectedRequest && (
            <>
              <Alert icon={<IconAlertCircle size={16} />} color="blue">
                <Text size="sm" fw={600} mb={4}>
                  Mail Item: {selectedRequest.mailItem.id}
                </Text>
                <Text size="xs" c="dimmed">
                  User: {selectedRequest.user.name} ({selectedRequest.user.email})
                </Text>
                <Text size="xs" c="dimmed">
                  Sender: {selectedRequest.mailItem.sender}
                </Text>
              </Alert>

              <Textarea
                label="Forwarding Address"
                value={selectedRequest.forwardAddress}
                disabled
                minRows={2}
              />

              <Select
                label="3PL Provider"
                placeholder="Select shipping provider"
                required
                data={common3PLProviders}
                value={threePLName}
                onChange={(value) => setThreePLName(value)}
                searchable
                description="Select the third-party logistics provider used for shipping"
              />

              <TextInput
                label="Tracking Number"
                placeholder="Enter tracking number"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                description="Tracking number provided by the 3PL"
              />

              <TextInput
                label="Tracking URL"
                placeholder="https://www.lbcexpress.com/ or https://www.jtexpress.ph/track-and-trace"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                description="Link to the 3PL's tracking page (e.g., https://www.lbcexpress.com/, https://www.jtexpress.ph/track-and-trace)"
                leftSection={<IconExternalLink size={16} />}
              />

              <Textarea
                label="Notes (Optional)"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                minRows={3}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  variant="subtle"
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedRequestId(null);
                    setThreePLName(null);
                    setTrackingNumber("");
                    setTrackingUrl("");
                    setNotes("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcessForward}
                  loading={loading}
                  disabled={!trackingNumber || !threePLName}
                  leftSection={<IconCheck size={18} />}
                >
                  Complete Forward
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
    </Stack>
  );
}

