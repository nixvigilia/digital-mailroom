"use client";

import {useState, useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import {
  Title,
  Text,
  Stack,
  Group,
  Paper,
  Image,
  Button,
  Badge,
  Divider,
  Box,
  Loader,
  Center,
  Tabs,
  TextInput,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconDownload,
  IconTag,
  IconArrowLeft,
  IconMail,
  IconCalendar,
  IconUser,
  IconFileText,
  IconPhoto,
} from "@tabler/icons-react";
import Link from "next/link";
import {MailActions} from "@/components/mail/MailActions";

// Mock data - will be replaced with backend integration
const getMockMailItem = (id: string) => {
  const mockItems: Record<string, any> = {
    "1": {
      id: "1",
      receivedAt: new Date("2025-01-15T10:30:00"),
      sender: "BDO Unibank",
      subject: "Monthly Statement",
      status: "received",
      envelopeScanUrl: undefined,
      hasFullScan: false,
      tags: ["Bills", "Financial"],
      category: "Financial",
      fullScanUrl: undefined,
      notes: "Monthly account statement for December 2024",
    },
    "2": {
      id: "2",
      receivedAt: new Date("2025-01-14T14:20:00"),
      sender: "Lazada Philippines",
      subject: "Package Delivery Notice",
      status: "scanned",
      envelopeScanUrl: undefined,
      hasFullScan: true,
      tags: ["Shopping"],
      category: "Shipping",
      fullScanUrl: undefined,
      notes: "Package delivery notification",
    },
    "3": {
      id: "3",
      receivedAt: new Date("2025-01-13T09:15:00"),
      sender: "Bureau of Internal Revenue (BIR)",
      subject: "Tax Document",
      status: "processed",
      envelopeScanUrl: undefined,
      hasFullScan: true,
      tags: ["Tax", "Important"],
      category: "Legal",
      fullScanUrl: undefined,
      notes: "Important tax document - please review",
    },
  };
  return mockItems[id] || null;
};

export default function MailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [mailItem, setMailItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    // TODO: Replace with actual data fetching
    const fetchMailItem = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const item = getMockMailItem(id);
        setMailItem(item);
        setTags(item?.tags || []);
        setLoading(false);
      }, 500);
    };

    if (id) {
      fetchMailItem();
    }
  }, [id]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      // TODO: Save to backend
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    // TODO: Save to backend
  };

  const handleDownload = (type: "envelope" | "full") => {
    // TODO: Implement download
    console.log(`Downloading ${type} scan for mail item ${id}`);
  };

  const statusColors: Record<string, string> = {
    received: "blue",
    scanned: "green",
    processed: "gray",
    archived: "orange",
  };

  if (loading) {
    return (
      <Center style={{minHeight: 400}}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!mailItem) {
    return (
      <Stack gap="md" align="center" py="xl">
        <Text size="lg" c="dimmed">
          Mail item not found
        </Text>
        <Button
          component={Link}
          href="/app"
          leftSection={<IconArrowLeft size={18} />}
        >
          Back to Inbox
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="sm">
        <Group justify="flex-start">
          <Button
            component={Link}
            href="/app"
            variant="subtle"
            leftSection={<IconArrowLeft size={18} />}
            size="md"
            visibleFrom="sm"
          >
            Back to Inbox
          </Button>
          <Button
            component={Link}
            href="/app"
            variant="subtle"
            leftSection={<IconArrowLeft size={18} />}
            size="sm"
            hiddenFrom="sm"
          >
            Back to Inbox
          </Button>
        </Group>
        <Stack gap="xs">
          <Group gap="sm" align="flex-start" wrap="wrap">
            <Title
              order={1}
              fw={800}
              style={{
                fontSize: "clamp(1.25rem, 4vw, 2rem)",
                flex: 1,
                minWidth: 200,
              }}
            >
              {mailItem.subject || "Mail Item"}
            </Title>
            <Badge
              color={statusColors[mailItem.status]}
              variant="light"
              size="lg"
              visibleFrom="sm"
            >
              {mailItem.status}
            </Badge>
            <Badge
              color={statusColors[mailItem.status]}
              variant="light"
              size="md"
              hiddenFrom="sm"
            >
              {mailItem.status}
            </Badge>
          </Group>
          <Stack gap="xs">
            {mailItem.sender && (
              <Group gap="xs" wrap="wrap">
                <IconUser size={16} color="var(--mantine-color-gray-6)" />
                <Text size="sm" c="dimmed" visibleFrom="sm">
                  {mailItem.sender}
                </Text>
                <Text size="xs" c="dimmed" hiddenFrom="sm">
                  {mailItem.sender}
                </Text>
              </Group>
            )}
            <Group gap="xs" wrap="wrap">
              <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
              <Text size="sm" c="dimmed" visibleFrom="sm">
                {new Date(mailItem.receivedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text size="xs" c="dimmed" hiddenFrom="sm">
                {new Date(mailItem.receivedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Group>
          </Stack>
        </Stack>
      </Stack>

      <Tabs defaultValue="details">
        <Tabs.List style={{overflowX: "auto", flexWrap: "nowrap"}}>
          <Tabs.Tab
            value="details"
            leftSection={<IconFileText size={16} />}
            style={{whiteSpace: "nowrap"}}
          >
            Details
          </Tabs.Tab>
          <Tabs.Tab
            value="scans"
            leftSection={<IconPhoto size={16} />}
            style={{whiteSpace: "nowrap"}}
          >
            Scans
          </Tabs.Tab>
          <Tabs.Tab
            value="tags"
            leftSection={<IconTag size={16} />}
            style={{whiteSpace: "nowrap"}}
          >
            Tags
          </Tabs.Tab>
        </Tabs.List>

        {/* Details Tab */}
        <Tabs.Panel value="details" pt={{base: "sm", sm: "md"}}>
          <Stack gap="md">
            <Paper withBorder p="md" radius="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                    Mail Information
                  </Text>
                </Group>
                <Divider />
                <Stack gap="sm">
                  {mailItem.sender && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Sender
                      </Text>
                      <Text size="sm" fw={500}>
                        {mailItem.sender}
                      </Text>
                    </Group>
                  )}
                  {mailItem.subject && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Subject
                      </Text>
                      <Text size="sm" fw={500}>
                        {mailItem.subject}
                      </Text>
                    </Group>
                  )}
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Status
                    </Text>
                    <Badge
                      color={statusColors[mailItem.status]}
                      variant="light"
                    >
                      {mailItem.status}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Received
                    </Text>
                    <Text size="sm" fw={500}>
                      {new Date(mailItem.receivedAt).toLocaleString()}
                    </Text>
                  </Group>
                  {mailItem.category && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Category
                      </Text>
                      <Badge variant="outline">{mailItem.category}</Badge>
                    </Group>
                  )}
                </Stack>
                {mailItem.notes && (
                  <>
                    <Divider />
                    <Stack gap="xs">
                      <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                        Notes
                      </Text>
                      <Text size="sm">{mailItem.notes}</Text>
                    </Stack>
                  </>
                )}
              </Stack>
            </Paper>

            {/* Physical Actions */}
            <MailActions mailId={id} status={mailItem.status} />
          </Stack>
        </Tabs.Panel>

        {/* Scans Tab */}
        <Tabs.Panel value="scans" pt="md">
          <Stack gap="md">
            {/* Envelope Scan */}
            <Paper withBorder p="md" radius="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                    Envelope Scan
                  </Text>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconDownload size={16} />}
                    onClick={() => handleDownload("envelope")}
                  >
                    Download
                  </Button>
                </Group>
                <Divider />
                {mailItem.envelopeScanUrl ? (
                  <Box
                    style={{
                      borderRadius: "var(--mantine-radius-md)",
                      overflow: "hidden",
                      backgroundColor: "var(--mantine-color-gray-1)",
                      minHeight: 400,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src={mailItem.envelopeScanUrl}
                      alt="Envelope scan"
                      style={{maxWidth: "100%"}}
                    />
                  </Box>
                ) : (
                  <Box
                    style={{
                      borderRadius: "var(--mantine-radius-md)",
                      backgroundColor: "var(--mantine-color-gray-1)",
                      minHeight: 400,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "md",
                    }}
                  >
                    <IconMail size={64} color="var(--mantine-color-gray-5)" />
                    <Text c="dimmed">Envelope scan not available</Text>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Full Document Scan */}
            {mailItem.hasFullScan && (
              <Paper withBorder p="md" radius="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                      Full Document Scan
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconDownload size={16} />}
                      onClick={() => handleDownload("full")}
                    >
                      Download PDF
                    </Button>
                  </Group>
                  <Divider />
                  {mailItem.fullScanUrl ? (
                    <Box
                      style={{
                        borderRadius: "var(--mantine-radius-md)",
                        overflow: "hidden",
                        backgroundColor: "var(--mantine-color-gray-1)",
                        minHeight: 400,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        src={mailItem.fullScanUrl}
                        alt="Full document scan"
                        style={{maxWidth: "100%"}}
                      />
                    </Box>
                  ) : (
                    <Box
                      style={{
                        borderRadius: "var(--mantine-radius-md)",
                        backgroundColor: "var(--mantine-color-gray-1)",
                        minHeight: 400,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "md",
                      }}
                    >
                      <IconFileText
                        size={64}
                        color="var(--mantine-color-gray-5)"
                      />
                      <Text c="dimmed">Full scan available for download</Text>
                      <Button
                        variant="light"
                        leftSection={<IconDownload size={18} />}
                        onClick={() => handleDownload("full")}
                      >
                        Download Full Scan
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Paper>
            )}

            {!mailItem.hasFullScan && (
              <Paper withBorder p="md" radius="md">
                <Stack gap="md" align="center">
                  <IconFileText size={48} color="var(--mantine-color-gray-5)" />
                  <Text c="dimmed" ta="center">
                    Full document scan not yet available. Request a scan using
                    the "Open & Scan" action in the Details tab.
                  </Text>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>

        {/* Tags Tab */}
        <Tabs.Panel value="tags" pt="md">
          <Stack gap="md">
            <Paper withBorder p="md" radius="md">
              <Stack gap="md">
                <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                  Tags
                </Text>
                <Divider />
                {tags.length > 0 ? (
                  <Group gap="xs">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="light"
                        size="lg"
                        rightSection={
                          <ActionIcon
                            size="xs"
                            color="blue"
                            radius="xl"
                            variant="transparent"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            ×
                          </ActionIcon>
                        }
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    No tags added yet
                  </Text>
                )}
                <Group gap="xs">
                  <TextInput
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddTag();
                      }
                    }}
                    style={{flex: 1}}
                  />
                  <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                    Add Tag
                  </Button>
                </Group>
              </Stack>
            </Paper>

            {mailItem.category && (
              <Paper withBorder p="md" radius="md">
                <Stack gap="md">
                  <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                    Category
                  </Text>
                  <Divider />
                  <Badge variant="outline" size="lg">
                    {mailItem.category}
                  </Badge>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
