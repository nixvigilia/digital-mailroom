"use client";

import {useState} from "react";
import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Table,
  Badge,
  TextInput,
  Select,
  ActionIcon,
  Tooltip,
  SimpleGrid,
  Card,
} from "@mantine/core";
import {
  IconInbox,
  IconSearch,
  IconFilter,
  IconEye,
  IconScan,
  IconTruck,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";

interface ActionRequest {
  id: string;
  mailItemId: string;
  userId: string;
  userName: string;
  userType: "individual" | "business";
  actionType: "scan" | "forward" | "shred";
  status: "pending" | "in_progress" | "completed" | "requires_approval";
  requestedAt: string; // ISO string from server
  priority: "low" | "medium" | "high";
  kycApproved: boolean;
  department?: string;
}

interface ActionQueueClientProps {
  initialRequests: ActionRequest[];
}

export function ActionQueueClient({initialRequests}: ActionQueueClientProps) {
  const [actionRequests] = useState<ActionRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredRequests = actionRequests.filter((request) => {
    if (statusFilter !== "all" && request.status !== statusFilter) return false;
    if (actionTypeFilter !== "all" && request.actionType !== actionTypeFilter)
      return false;
    if (priorityFilter !== "all" && request.priority !== priorityFilter)
      return false;
    if (
      searchQuery &&
      !request.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !request.mailItemId.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    pending: "yellow",
    in_progress: "blue",
    completed: "green",
    requires_approval: "orange",
  };

  const actionTypeIcons = {
    scan: IconScan,
    forward: IconTruck,
    shred: IconTrash,
  };

  const priorityColors: Record<string, string> = {
    high: "red",
    medium: "yellow",
    low: "gray",
  };

  // Statistics
  const stats = {
    total: actionRequests.length,
    pending: actionRequests.filter((r) => r.status === "pending").length,
    inProgress: actionRequests.filter((r) => r.status === "in_progress").length,
    requiresApproval: actionRequests.filter(
      (r) => r.status === "requires_approval"
    ).length,
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group gap="md" align="center">
          <IconInbox size={32} color="var(--mantine-color-blue-6)" />
          <Title
            order={1}
            fw={800}
            style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
          >
            Action Queue
          </Title>
        </Group>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Process mail action requests from users
        </Text>
      </Stack>

      {/* Statistics */}
      <SimpleGrid cols={{base: 2, sm: 4}} spacing="md">
        <Card withBorder p="md" radius="md">
          <Stack gap={4}>
            <Text size="sm" c="dimmed" fw={500}>
              Total Requests
            </Text>
            <Text size="xl" fw={700}>
              {stats.total}
            </Text>
          </Stack>
        </Card>
        <Card withBorder p="md" radius="md">
          <Stack gap={4}>
            <Text size="sm" c="dimmed" fw={500}>
              Pending
            </Text>
            <Text size="xl" fw={700} c="yellow">
              {stats.pending}
            </Text>
          </Stack>
        </Card>
        <Card withBorder p="md" radius="md">
          <Stack gap={4}>
            <Text size="sm" c="dimmed" fw={500}>
              In Progress
            </Text>
            <Text size="xl" fw={700} c="blue">
              {stats.inProgress}
            </Text>
          </Stack>
        </Card>
        <Card withBorder p="md" radius="md">
          <Stack gap={4}>
            <Text size="sm" c="dimmed" fw={500}>
              Needs Approval
            </Text>
            <Text size="xl" fw={700} c="orange">
              {stats.requiresApproval}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Paper withBorder p="md" radius="md">
        <Group gap="md" wrap="wrap">
          <TextInput
            placeholder="Search by user or mail item..."
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
              {value: "in_progress", label: "In Progress"},
              {value: "requires_approval", label: "Requires Approval"},
              {value: "completed", label: "Completed"},
            ]}
            style={{minWidth: 160}}
          />
          <Select
            placeholder="Filter by action"
            value={actionTypeFilter}
            onChange={(value) => setActionTypeFilter(value || "all")}
            data={[
              {value: "all", label: "All Actions"},
              {value: "scan", label: "Scan"},
              {value: "forward", label: "Forward"},
              {value: "shred", label: "Shred"},
            ]}
            style={{minWidth: 140}}
          />
          <Select
            placeholder="Filter by priority"
            value={priorityFilter}
            onChange={(value) => setPriorityFilter(value || "all")}
            data={[
              {value: "all", label: "All Priorities"},
              {value: "high", label: "High"},
              {value: "medium", label: "Medium"},
              {value: "low", label: "Low"},
            ]}
            style={{minWidth: 140}}
          />
        </Group>
      </Paper>

      {/* Action Requests Table */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconInbox size={24} />
              <Title order={2} size="h3">
                Action Requests ({filteredRequests.length})
              </Title>
            </Group>
          </Group>
          {filteredRequests.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No action requests found.
            </Text>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Mail Item</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Priority</Table.Th>
                  <Table.Th>KYC Status</Table.Th>
                  <Table.Th>Requested</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredRequests.map((request) => {
                  const ActionIcon = actionTypeIcons[request.actionType];
                  return (
                    <Table.Tr key={request.id}>
                      <Table.Td>
                        <Text fw={500} size="sm">
                          {request.mailItemId.substring(0, 8)}...
                        </Text>
                        {request.department && (
                          <Text size="xs" c="dimmed">
                            {request.department}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm" fw={500}>
                            {request.userName}
                          </Text>
                          <Badge size="xs" variant="outline">
                            {request.userType}
                          </Badge>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          leftSection={<ActionIcon size={12} />}
                          variant="light"
                          color="blue"
                        >
                          {request.actionType}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={statusColors[request.status]}
                          variant="light"
                        >
                          {request.status.replace("_", " ")}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={priorityColors[request.priority]}
                          variant="light"
                          size="sm"
                        >
                          {request.priority}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {request.kycApproved ? (
                          <Badge color="green" variant="light" size="sm">
                            Approved
                          </Badge>
                        ) : (
                          <Badge color="red" variant="light" size="sm">
                            Not Approved
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {new Date(request.requestedAt).toLocaleString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Tooltip label="View Details">
                            <Link
                              href={`/operator/queue/${request.mailItemId}`}
                            >
                              <ActionIcon variant="light">
                                <IconEye size={16} />
                              </ActionIcon>
                            </Link>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}







