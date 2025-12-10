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
  SegmentedControl,
  SimpleGrid,
  Alert,
  Button,
  Card,
  ThemeIcon,
} from "@mantine/core";
import {
  IconSearch,
  IconFilter,
  IconInbox,
  IconArchive,
  IconTag,
  IconAlertCircle,
  IconHourglassHigh,
  IconCheck,
  IconMail,
} from "@tabler/icons-react";
import {MailItemCard, MailItem} from "@/components/mail/MailItemCard";
import Link from "next/link";

// Mock data - will be replaced with backend integration
const mockArchivedItems: MailItem[] = [
  {
    id: "archived-1",
    receivedAt: new Date("2024-12-10T10:30:00"),
    sender: "Utility Company",
    subject: "December Bill",
    status: "archived",
    hasFullScan: true,
    tags: ["Bills", "Utilities"],
  },
];

interface ArchivedPageClientProps {
  kycStatus: string;
}

export function ArchivedPageClient({kycStatus}: ArchivedPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("");
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
    return true;
  });

  const allTags = Array.from(
    new Set(mailItems.flatMap((item) => item.tags || []))
  );

  if (kycStatus === "PENDING") {
    return (
      <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={1} fw={800} size="h2">
            Archived
          </Title>
        </Group>

        <Card
          shadow="sm"
          padding="xl"
          radius="md"
          withBorder
          style={{
            minHeight: "500px",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack gap="xl" align="center" w="100%">
            <ThemeIcon color="yellow" size={80} radius="xl" variant="light">
              <IconHourglassHigh size={40} />
            </ThemeIcon>
            <Stack gap="xs" align="center">
              <Title order={2} size="h3">
                Verification Pending
              </Title>
              <Text c="dimmed" ta="center" maw={500}>
                Your identity verification is currently under review. You will be
                able to access your archived mail items once your verification is
                approved.
              </Text>
            </Stack>

            <Card
              withBorder
              radius="md"
              p="lg"
              w="100%"
              maw={600}
              bg="var(--mantine-color-gray-0)"
            >
              <Stack gap="md">
                <Text fw={600} size="sm">
                  What happens next?
                </Text>
                <Stack gap="sm">
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon
                      color="blue"
                      size="sm"
                      radius="xl"
                      variant="filled"
                      mt={2}
                    >
                      <IconCheck size={10} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed" lh={1.4}>
                      <Text span fw={600} c="dark">
                        Review in Progress:
                      </Text>{" "}
                      Our team is carefully reviewing the documents you submitted.
                      This process typically takes 1-2 business days.
                    </Text>
                  </Group>
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon
                      color="blue"
                      size="sm"
                      radius="xl"
                      variant="filled"
                      mt={2}
                    >
                      <IconMail size={10} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed" lh={1.4}>
                      <Text span fw={600} c="dark">
                        Notification:
                      </Text>{" "}
                      We will notify you via email as soon as your account is
                      verified. No further action is required from you at this
                      time.
                    </Text>
                  </Group>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>

      {/* Header */}
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap="xs">
          <Title order={1} fw={800} size="2.5rem">
            Archived
          </Title>
          <Text c="dimmed" size="lg">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
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
