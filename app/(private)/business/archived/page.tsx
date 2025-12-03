"use client";

import {useState} from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  TextInput,
  Select,
  Badge,
  Paper,
  SimpleGrid,
} from "@mantine/core";
import {
  IconSearch,
  IconFilter,
  IconArchive,
  IconTag,
  IconBuilding,
} from "@tabler/icons-react";
import {MailItemCard, MailItem} from "@/components/mail/MailItemCard";

// Mock data - will be replaced with backend integration
const mockArchivedItems: MailItem[] = [
  {
    id: "archived-1",
    receivedAt: new Date("2024-12-10T10:30:00"),
    sender: "BIR - Bureau of Internal Revenue",
    subject: "Tax Assessment Notice",
    status: "archived",
    hasFullScan: true,
    tags: ["Tax", "Finance", "Important"],
    department: "Finance",
    assignedTo: "John Doe",
  },
  {
    id: "archived-2",
    receivedAt: new Date("2024-12-05T14:20:00"),
    sender: "SSS - Social Security System",
    subject: "Employee Contribution Statement",
    status: "archived",
    hasFullScan: true,
    tags: ["HR", "Benefits"],
    department: "Human Resources",
    assignedTo: "Jane Smith",
  },
];

export default function BusinessArchivedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [mailItems] = useState<MailItem[]>(mockArchivedItems);

  const filteredItems = mailItems.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (
      searchQuery &&
      !item.sender?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (tagFilter && tagFilter !== "" && !item.tags?.includes(tagFilter))
      return false;
    if (
      departmentFilter !== "all" &&
      item.department?.toLowerCase() !== departmentFilter.toLowerCase()
    )
      return false;
    return true;
  });

  const allTags = Array.from(
    new Set(mailItems.flatMap((item) => item.tags || []))
  );

  const departments = [
    {value: "all", label: "All Departments"},
    {value: "finance", label: "Finance"},
    {value: "hr", label: "Human Resources"},
    {value: "legal", label: "Legal"},
    {value: "operations", label: "Operations"},
  ];

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap="xs">
          <Group gap="md" align="center">
            <IconBuilding size={32} color="var(--mantine-color-blue-6)" />
            <Title order={1} fw={800} size="2.5rem">
              Archived
            </Title>
          </Group>
          <Text c="dimmed" size="lg">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </Text>
        </Stack>
      </Group>

      {/* Filters */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="md" wrap="wrap">
            <TextInput
              placeholder="Search archived mail..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{flex: 1, minWidth: 200}}
            />
            <Select
              placeholder="Filter by department"
              leftSection={<IconBuilding size={16} />}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              data={departments}
              style={{minWidth: 180}}
            />
            {allTags.length > 0 && (
              <Select
                placeholder="Filter by tag"
                leftSection={<IconTag size={16} />}
                value={tagFilter}
                onChange={(value) => setTagFilter(value || "")}
                data={[
                  {value: "", label: "All Tags"},
                  ...allTags.map((tag) => ({value: tag, label: tag})),
                ]}
                clearable
                style={{minWidth: 150}}
              />
            )}
          </Group>
        </Stack>
      </Paper>

      {/* Mail Items List */}
      {filteredItems.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Stack gap="md" align="center">
            <IconArchive size={48} color="var(--mantine-color-gray-5)" />
            <Text size="lg" c="dimmed" ta="center">
              No archived items found.
            </Text>
          </Stack>
        </Paper>
      ) : (
        <SimpleGrid
          cols={{base: 1, sm: 2, md: 3, lg: 4}}
          spacing={{base: "md", sm: "lg", md: "xl"}}
        >
          {filteredItems.map((item) => (
            <MailItemCard key={item.id} item={item} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}

