"use client";

import {useState} from "react";
import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Badge,
  Table,
  Pagination,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {IconScan, IconInbox, IconEye} from "@tabler/icons-react";
import Link from "next/link";
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
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);

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
          Process scan requests for mail items
        </Text>
      </Stack>

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
                      <Table.Th>User</Table.Th>
                      <Table.Th>Sender</Table.Th>
                      <Table.Th>Requested At</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>KYC Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {initialData.requests.map((item) => (
                      <Table.Tr key={item.id}>
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
                        <Table.Td>
                          <Tooltip label="View Details">
                            <Link href={`/operator/queue/${item.mailItemId}`}>
                              <ActionIcon variant="light">
                                <IconEye size={16} />
                              </ActionIcon>
                            </Link>
                          </Tooltip>
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
