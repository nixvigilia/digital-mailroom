"use client";

import {useState} from "react";
import {
  Stack,
  Group,
  Image,
  Button,
  Badge,
  Divider,
  Box,
  Tabs,
  TextInput,
  ActionIcon,
  Card,
  Text,
} from "@mantine/core";
import {
  IconDownload,
  IconTag,
  IconMail,
  IconFileText,
  IconPhoto,
} from "@tabler/icons-react";
import {MailActions} from "@/components/mail/MailActions";
import {PDFViewer} from "@/components/mail/PDFViewer";

interface MailDetailClientProps {
  mailItem: {
    id: string;
    receivedAt: Date;
    sender?: string;
    subject?: string;
    status: "received" | "scanned" | "processed" | "archived";
    envelopeScanUrl?: string;
    hasFullScan: boolean;
    fullScanUrl?: string;
    tags: string[];
    category?: string;
    notes?: string;
    defaultForwardAddress?: string | null;
    hasShreddingPin?: boolean;
    pendingScanRequest?: {
      status: string;
      requestedAt: Date;
    } | null;
  };
  mailId: string;
}

export function MailDetailClient({mailItem, mailId}: MailDetailClientProps) {
  const [tags, setTags] = useState<string[]>(mailItem.tags);
  const [newTag, setNewTag] = useState("");

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
    const url =
      type === "envelope" ? mailItem.envelopeScanUrl : mailItem.fullScanUrl;
    if (url) {
      // Open in a new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const statusColors: Record<string, string> = {
    received: "blue",
    scanned: "green",
    processed: "gray",
    archived: "orange",
  };

  return (
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
          <Card shadow="sm" padding="md" radius="md" withBorder={false}>
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
                  <Badge color={statusColors[mailItem.status]} variant="light">
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
          </Card>

          {/* Physical Actions */}
          <MailActions
            mailId={mailId}
            status={mailItem.status}
            defaultForwardAddress={mailItem.defaultForwardAddress || ""}
            hasShreddingPin={mailItem.hasShreddingPin || false}
            pendingScanRequest={mailItem.pendingScanRequest}
          />
        </Stack>
      </Tabs.Panel>

      {/* Scans Tab */}
      <Tabs.Panel value="scans" pt="md">
        <Stack gap="md">
          {/* Envelope Scan */}
          <Card shadow="sm" padding="md" radius="md" withBorder={false}>
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                  Envelope Scan
                </Text>
                {mailItem.envelopeScanUrl && (
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconDownload size={16} />}
                    onClick={() => handleDownload("envelope")}
                  >
                    Download
                  </Button>
                )}
              </Group>
              <Divider />
              {mailItem.envelopeScanUrl ? (
                <Box
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    overflow: "hidden",
                    backgroundColor: "var(--mantine-color-gray-1)",
                    height: 500,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src={mailItem.envelopeScanUrl}
                    alt="Envelope scan"
                    fit="contain"
                    style={{maxHeight: "100%", maxWidth: "100%"}}
                  />
                </Box>
              ) : (
                <Box
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    backgroundColor: "var(--mantine-color-gray-1)",
                    height: 500,
                    width: "100%",
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
          </Card>

          {/* Full Document Scan */}
          {mailItem.hasFullScan && (
            <Card shadow="sm" padding="md" radius="md" withBorder={false}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                    Full Document Scan
                  </Text>
                  {mailItem.fullScanUrl && (
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconDownload size={16} />}
                      onClick={() => handleDownload("full")}
                    >
                      Download PDF
                    </Button>
                  )}
                </Group>
                <Divider />
                {mailItem.fullScanUrl ? (
                  <PDFViewer
                    url={mailItem.fullScanUrl}
                    alt="Full document scan"
                    height={600}
                  />
                ) : (
                  <Box
                    style={{
                      borderRadius: "var(--mantine-radius-md)",
                      backgroundColor: "var(--mantine-color-gray-1)",
                      height: 600,
                      width: "100%",
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
            </Card>
          )}

          {!mailItem.hasFullScan && (
            <Card shadow="sm" padding="md" radius="md" withBorder={false}>
              <Stack gap="md" align="center">
                <IconFileText size={48} color="var(--mantine-color-gray-5)" />
                <Text c="dimmed" ta="center">
                  Full document scan not yet available. Request a scan using the
                  "Open & Scan" action in the Details tab.
                </Text>
              </Stack>
            </Card>
          )}
        </Stack>
      </Tabs.Panel>

      {/* Tags Tab */}
      <Tabs.Panel value="tags" pt="md">
        <Stack gap="md">
          <Card shadow="sm" padding="md" radius="md" withBorder={false}>
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
          </Card>

          {mailItem.category && (
            <Card shadow="sm" padding="md" radius="md" withBorder={false}>
              <Stack gap="md">
                <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                  Category
                </Text>
                <Divider />
                <Badge variant="outline" size="lg">
                  {mailItem.category}
                </Badge>
              </Stack>
            </Card>
          )}
        </Stack>
      </Tabs.Panel>
    </Tabs>
  );
}
