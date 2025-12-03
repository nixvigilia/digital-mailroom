"use client";

import {useState} from "react";
import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  Table,
  Badge,
  TextInput,
  Select,
  ActionIcon,
  Tooltip,
  Modal,
  Tabs,
  Alert,
  Image,
  Divider,
} from "@mantine/core";
import {
  IconUserCheck,
  IconSearch,
  IconFilter,
  IconEye,
  IconCheck,
  IconX,
  IconFileText,
  IconBuilding,
  IconId,
} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";

// Mock KYC/KYB submissions - will be replaced with backend
interface VerificationSubmission {
  id: string;
  userId: string;
  userName: string;
  userType: "individual" | "business";
  type: "kyc" | "kyb";
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  businessName?: string;
  department?: string;
}

const mockSubmissions: VerificationSubmission[] = [
  {
    id: "1",
    userId: "user-1",
    userName: "John Doe",
    userType: "individual",
    type: "kyc",
    status: "pending",
    submittedAt: new Date("2025-01-14T10:00:00"),
  },
  {
    id: "2",
    userId: "user-2",
    userName: "Jane Smith",
    userType: "business",
    type: "kyb",
    status: "pending",
    submittedAt: new Date("2025-01-13T14:30:00"),
    businessName: "ABC Corporation",
    department: "Finance",
  },
  {
    id: "3",
    userId: "user-3",
    userName: "Mike Johnson",
    userType: "individual",
    type: "kyc",
    status: "approved",
    submittedAt: new Date("2025-01-10T09:15:00"),
  },
];

export default function ApprovalsPage() {
  const [submissions, setSubmissions] = useState<VerificationSubmission[]>(mockSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<VerificationSubmission | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter !== "all" && sub.status !== statusFilter) return false;
    if (typeFilter !== "all" && sub.type !== typeFilter) return false;
    if (
      searchQuery &&
      !sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sub.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleReview = (submission: VerificationSubmission) => {
    setSelectedSubmission(submission);
    setReviewModalOpen(true);
  };

  const handleApprove = () => {
    if (!selectedSubmission) return;
    // TODO: Implement actual approval API call
    setSubmissions(
      submissions.map((s) =>
        s.id === selectedSubmission.id ? {...s, status: "approved"} : s
      )
    );
    setReviewModalOpen(false);
    setSelectedSubmission(null);
    notifications.show({
      title: "Success",
      message: "Verification approved successfully",
      color: "green",
    });
  };

  const handleReject = () => {
    if (!selectedSubmission) return;
    // TODO: Implement actual rejection API call
    setSubmissions(
      submissions.map((s) =>
        s.id === selectedSubmission.id ? {...s, status: "rejected"} : s
      )
    );
    setReviewModalOpen(false);
    setSelectedSubmission(null);
    notifications.show({
      title: "Success",
      message: "Verification rejected",
      color: "orange",
    });
  };

  const statusColors: Record<string, string> = {
    pending: "yellow",
    approved: "green",
    rejected: "red",
  };

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group gap="md" align="center">
          <IconUserCheck size={32} color="var(--mantine-color-blue-6)" />
          <Title
            order={1}
            fw={800}
            style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
          >
            KYC/KYB Approvals
          </Title>
        </Group>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Review and approve user verification submissions
        </Text>
      </Stack>

      {pendingCount > 0 && (
        <Alert icon={<IconUserCheck size={16} />} color="yellow">
          You have {pendingCount} pending verification{pendingCount > 1 ? "s" : ""} to review.
        </Alert>
      )}

      {/* Filters */}
      <Paper withBorder p="md" radius="md">
        <Group gap="md" wrap="wrap">
          <TextInput
            placeholder="Search by name or business..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{flex: 1, minWidth: 200}}
          />
          <Select
            placeholder="Filter by status"
            leftSection={<IconFilter size={16} />}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "all")}
            data={[
              {value: "all", label: "All Status"},
              {value: "pending", label: "Pending"},
              {value: "approved", label: "Approved"},
              {value: "rejected", label: "Rejected"},
            ]}
            style={{minWidth: 140}}
          />
          <Select
            placeholder="Filter by type"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value || "all")}
            data={[
              {value: "all", label: "All Types"},
              {value: "kyc", label: "KYC (Individual)"},
              {value: "kyb", label: "KYB (Business)"},
            ]}
            style={{minWidth: 160}}
          />
        </Group>
      </Paper>

      {/* Submissions Table */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconUserCheck size={24} />
              <Title order={2} size="h3">
                Verification Submissions ({filteredSubmissions.length})
              </Title>
            </Group>
          </Group>
          {filteredSubmissions.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No verification submissions found.
            </Text>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User / Business</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Submitted</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredSubmissions.map((submission) => (
                  <Table.Tr key={submission.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={500} size="sm">
                          {submission.businessName || submission.userName}
                        </Text>
                        {submission.businessName && (
                          <Text size="xs" c="dimmed">
                            {submission.userName}
                          </Text>
                        )}
                        <Badge size="xs" variant="outline">
                          {submission.userType}
                        </Badge>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        leftSection={
                          submission.type === "kyb" ? (
                            <IconBuilding size={12} />
                          ) : (
                            <IconId size={12} />
                          )
                        }
                        variant="light"
                        color="blue"
                      >
                        {submission.type.toUpperCase()}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={statusColors[submission.status]} variant="light">
                        {submission.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {submission.submittedAt.toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Review Submission">
                          <ActionIcon
                            variant="light"
                            onClick={() => handleReview(submission)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {/* Review Modal */}
      <Modal
        opened={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedSubmission(null);
        }}
        title="Review Verification Submission"
        size="xl"
      >
        {selectedSubmission && (
          <Stack gap="md">
            <Tabs defaultValue="info">
              <Tabs.List>
                <Tabs.Tab value="info" leftSection={<IconFileText size={16} />}>
                  Information
                </Tabs.Tab>
                <Tabs.Tab value="documents" leftSection={<IconId size={16} />}>
                  Documents
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="info" pt="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        User
                      </Text>
                      <Text fw={500}>{selectedSubmission.userName}</Text>
                    </Stack>
                    <Badge color={statusColors[selectedSubmission.status]} variant="light">
                      {selectedSubmission.status}
                    </Badge>
                  </Group>
                  <Divider />
                  {selectedSubmission.businessName && (
                    <>
                      <Stack gap={4}>
                        <Text size="sm" c="dimmed">
                          Business Name
                        </Text>
                        <Text fw={500}>{selectedSubmission.businessName}</Text>
                      </Stack>
                      {selectedSubmission.department && (
                        <Stack gap={4}>
                          <Text size="sm" c="dimmed">
                            Department
                          </Text>
                          <Text>{selectedSubmission.department}</Text>
                        </Stack>
                      )}
                    </>
                  )}
                  <Stack gap={4}>
                    <Text size="sm" c="dimmed">
                      Type
                    </Text>
                    <Badge variant="light" color="blue">
                      {selectedSubmission.type.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" c="dimmed">
                      Submitted At
                    </Text>
                    <Text>{selectedSubmission.submittedAt.toLocaleString()}</Text>
                  </Stack>
                  {/* TODO: Add more detailed information from backend */}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="documents" pt="md">
                <Stack gap="md">
                  <Alert color="blue">
                    Document preview will be loaded from backend. This includes ID
                    documents, business registration, tax certificates, etc.
                  </Alert>
                  {/* TODO: Add document preview components */}
                </Stack>
              </Tabs.Panel>
            </Tabs>

            <Divider />

            <Group justify="flex-end" gap="md">
              <Button
                variant="subtle"
                onClick={() => {
                  setReviewModalOpen(false);
                  setSelectedSubmission(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                color="red"
                leftSection={<IconX size={18} />}
                onClick={handleReject}
              >
                Reject
              </Button>
              <Button
                leftSection={<IconCheck size={18} />}
                onClick={handleApprove}
                disabled={selectedSubmission.status !== "pending"}
              >
                Approve
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}


