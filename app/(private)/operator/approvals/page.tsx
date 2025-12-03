"use client";

import {useEffect, useState} from "react";
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
  Textarea,
  Loader,
  Center,
  SimpleGrid,
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
  IconRefresh,
} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";
import {
  getKYCRequestDetails,
  reviewKYCRequest,
  KYCRequest,
  KYCDetails,
} from "@/app/actions/operator-kyc";
import useSWR, {mutate} from "swr";

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((res) => {
      if (res.success) return res.data;
      throw new Error(res.message);
    });

export default function ApprovalsPage() {
  const {
    data: submissions = [],
    error,
    isLoading,
    mutate: refreshSubmissions,
  } = useSWR<KYCRequest[]>("/api/operator/kyc/approvals", fetcher);

  const [selectedSubmission, setSelectedSubmission] =
    useState<KYCDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to fetch submissions",
        color: "red",
      });
    }
  }, [error]);

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter !== "all" && sub.status !== statusFilter) return false;
    // Currently only handling KYC, so type filter is implicit or we can add it back later if KYB is mixed in
    const fullName = `${sub.firstName} ${sub.lastName}`;
    if (
      searchQuery &&
      !fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sub.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleReview = async (id: string) => {
    setDetailsLoading(true);
    setReviewModalOpen(true);
    const result = await getKYCRequestDetails(id);
    if (result.success && result.data) {
      setSelectedSubmission(result.data);
    } else {
      notifications.show({
        title: "Error",
        message: result.message || "Failed to fetch details",
        color: "red",
      });
      setReviewModalOpen(false);
    }
    setDetailsLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;

    const result = await reviewKYCRequest(selectedSubmission.id, "APPROVED");

    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Verification approved successfully",
        color: "green",
      });
      setReviewModalOpen(false);
      setSelectedSubmission(null);
      refreshSubmissions();
    } else {
      notifications.show({
        title: "Error",
        message: result.message || "Failed to approve",
        color: "red",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    if (!rejectionReason.trim()) {
      notifications.show({
        title: "Error",
        message: "Please provide a rejection reason",
        color: "red",
      });
      return;
    }

    const result = await reviewKYCRequest(
      selectedSubmission.id,
      "REJECTED",
      rejectionReason
    );

    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Verification rejected",
        color: "orange",
      });
      setRejectModalOpen(false);
      setReviewModalOpen(false);
      setSelectedSubmission(null);
      setRejectionReason("");
      refreshSubmissions();
    } else {
      notifications.show({
        title: "Error",
        message: result.message || "Failed to reject",
        color: "red",
      });
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: "yellow",
    APPROVED: "green",
    REJECTED: "red",
    NOT_STARTED: "gray",
  };

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group gap="md" align="center" justify="space-between">
          <Group>
            <IconUserCheck size={32} color="var(--mantine-color-blue-6)" />
            <Title
              order={1}
              fw={800}
              style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
            >
              KYC/KYB Approvals
            </Title>
          </Group>
        </Group>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Review and approve user verification submissions
        </Text>
      </Stack>

      {pendingCount > 0 && (
        <Alert icon={<IconUserCheck size={16} />} color="yellow">
          You have {pendingCount} pending verification
          {pendingCount !== 1 ? "s" : ""} to review.
        </Alert>
      )}

      {/* Filters */}
      <Paper withBorder p="md" radius="md">
        <Group gap="md" wrap="wrap">
          <TextInput
            placeholder="Search by name or email..."
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
              {value: "PENDING", label: "Pending"},
              {value: "APPROVED", label: "Approved"},
              {value: "REJECTED", label: "Rejected"},
            ]}
            style={{minWidth: 140}}
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

          {isLoading ? (
            <Center py="xl">
              <Loader size="lg" />
            </Center>
          ) : filteredSubmissions.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No verification submissions found.
            </Text>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
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
                          {submission.firstName} {submission.lastName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {submission.email}
                        </Text>
                        <Badge size="xs" variant="outline">
                          {submission.userType}
                        </Badge>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        leftSection={
                          submission.userType === "BUSINESS" ? (
                            <IconBuilding size={12} />
                          ) : (
                            <IconId size={12} />
                          )
                        }
                        variant="light"
                        color="blue"
                      >
                        KYC
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={statusColors[submission.status]}
                        variant="light"
                      >
                        {submission.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleString()
                          : "N/A"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Review Submission">
                          <ActionIcon
                            variant="light"
                            onClick={() => handleReview(submission.id)}
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
        {detailsLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : selectedSubmission ? (
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
                        Applicant
                      </Text>
                      <Text fw={500}>
                        {selectedSubmission.firstName}{" "}
                        {selectedSubmission.lastName}
                      </Text>
                    </Stack>
                    <Badge
                      color={statusColors[selectedSubmission.status]}
                      variant="light"
                    >
                      {selectedSubmission.status}
                    </Badge>
                  </Group>
                  <Divider />

                  <SimpleGrid cols={2}>
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        Date of Birth
                      </Text>
                      <Text>
                        {new Date(
                          selectedSubmission.dateOfBirth
                        ).toLocaleDateString()}
                      </Text>
                    </Stack>
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        Phone
                      </Text>
                      <Text>{selectedSubmission.phoneNumber}</Text>
                    </Stack>
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        ID Type
                      </Text>
                      <Text>{selectedSubmission.idType}</Text>
                    </Stack>
                    <Stack gap={4}>
                      <Text size="sm" c="dimmed">
                        Email
                      </Text>
                      <Text>{selectedSubmission.email}</Text>
                    </Stack>
                  </SimpleGrid>

                  <Divider label="Address" labelPosition="center" />

                  <Stack gap={4}>
                    <Text>{selectedSubmission.address}</Text>
                    <Text>
                      {selectedSubmission.city}, {selectedSubmission.province}
                    </Text>
                    <Text>{selectedSubmission.postalCode}</Text>
                    <Text>{selectedSubmission.country}</Text>
                  </Stack>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="documents" pt="md">
                <Stack gap="md">
                  <Text fw={500}>Front ID</Text>
                  {selectedSubmission.idFileFrontSignedUrl ? (
                    <Image
                      src={selectedSubmission.idFileFrontSignedUrl}
                      alt="Front ID"
                      radius="md"
                      mah={400}
                      fit="contain"
                    />
                  ) : (
                    <Alert color="red">Image not available</Alert>
                  )}

                  <Divider />

                  <Text fw={500}>Back ID</Text>
                  {selectedSubmission.idFileBackSignedUrl ? (
                    <Image
                      src={selectedSubmission.idFileBackSignedUrl}
                      alt="Back ID"
                      radius="md"
                      mah={400}
                      fit="contain"
                    />
                  ) : (
                    <Alert color="red">Image not available</Alert>
                  )}
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
                onClick={() => setRejectModalOpen(true)}
                disabled={selectedSubmission.status !== "PENDING"}
              >
                Reject
              </Button>
              <Button
                leftSection={<IconCheck size={18} />}
                onClick={handleApprove}
                disabled={selectedSubmission.status !== "PENDING"}
              >
                Approve
              </Button>
            </Group>
          </Stack>
        ) : (
          <Text c="red">Failed to load details</Text>
        )}
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        opened={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Verification"
      >
        <Stack>
          <Text size="sm">
            Please provide a reason for rejecting this verification request:
          </Text>
          <Textarea
            placeholder="Reason for rejection..."
            minRows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
