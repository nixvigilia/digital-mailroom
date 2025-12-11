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
  SimpleGrid,
  Paper,
} from "@mantine/core";
import {
  IconDownload,
  IconTag,
  IconMail,
  IconFileText,
  IconPhoto,
  IconTrash,
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
    pendingForwardRequest?: {
      status: string;
      requestedAt: Date;
    } | null;
    pendingDisposeRequest?: {
      status: string;
      requestedAt: Date;
    } | null;
    isForwarded?: boolean;
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
      <Tabs.List
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-3)",
          marginBottom: "2rem",
        }}
      >
        <Tabs.Tab
          value="details"
          leftSection={<IconFileText size={18} />}
          style={{
            padding: "1rem 0.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          Details
        </Tabs.Tab>
        <Tabs.Tab
          value="scans"
          leftSection={<IconPhoto size={18} />}
          style={{
            padding: "1rem 0.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Scans
        </Tabs.Tab>
        <Tabs.Tab
          value="tags"
          leftSection={<IconTag size={18} />}
          style={{
            padding: "1rem 0.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Tags
        </Tabs.Tab>
      </Tabs.List>

      {/* Details Tab */}
      <Tabs.Panel value="details">
        {/* Envelope Scan Section */}
        <Stack gap="md">
          <Text size="lg" fw={600}>
            Envelope Scan
          </Text>
          <Paper
            withBorder
            p="xl"
            radius="md"
            style={{
              border: "1px solid var(--mantine-color-gray-3)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Stack gap="md">
              {mailItem.envelopeScanUrl ? (
                <>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Envelope preview
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
                  <Box
                    style={{
                      borderRadius: "var(--mantine-radius-md)",
                      overflow: "hidden",
                      backgroundColor: "var(--mantine-color-gray-1)",
                      height: 400,
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
                </>
              ) : (
                <Box
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    backgroundColor: "var(--mantine-color-gray-1)",
                    height: 300,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "md",
                  }}
                >
                  <IconMail size={48} color="var(--mantine-color-gray-5)" />
                  <Text c="dimmed">Envelope scan not available</Text>
                </Box>
              )}
            </Stack>
          </Paper>
        </Stack>

        <Stack gap="xl">
          {/* Mail Information Section */}
          <Stack gap="md">
            <Text size="lg" fw={600} mt="md">
              Mail Information
            </Text>
            <Paper
              withBorder
              p={0}
              radius="md"
              style={{
                border: "1px solid var(--mantine-color-gray-3)",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <SimpleGrid
                cols={{base: 1, md: 3}}
                spacing={0}
                style={{
                  borderBottom: "1px solid var(--mantine-color-gray-3)",
                }}
              >
                <Box
                  p="xl"
                  style={{borderRight: "1px solid var(--mantine-color-gray-3)"}}
                >
                  <Text size="sm" c="dimmed" mb={4}>
                    Sender
                  </Text>
                  <Text fw={500}>{mailItem.sender || "Unknown"}</Text>
                </Box>
                <Box
                  p="xl"
                  style={{
                    borderRight: "1px solid var(--mantine-color-gray-3)",
                  }}
                  visibleFrom="md"
                >
                  <Text size="sm" c="dimmed" mb={4}>
                    Status
                  </Text>
                  <Text fw={500} c="blue">
                    {mailItem.status.charAt(0).toUpperCase() +
                      mailItem.status.slice(1)}
                  </Text>
                </Box>
                <Box p="xl">
                  <Text size="sm" c="dimmed" mb={4}>
                    Received At
                  </Text>
                  <Text fw={500}>
                    {new Date(mailItem.receivedAt).toLocaleString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                </Box>
              </SimpleGrid>
              {mailItem.notes && (
                <Box
                  p="xl"
                  style={{
                    borderTop: "1px solid var(--mantine-color-gray-3)",
                  }}
                >
                  <Text size="sm" c="dimmed" mb={8}>
                    Notes
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      fontFamily: "monospace",
                      backgroundColor: "var(--mantine-color-gray-0)",
                      padding: "0.75rem",
                      borderRadius: "0.375rem",
                      color: "var(--mantine-color-gray-7)",
                    }}
                  >
                    {mailItem.notes}
                  </Text>
                </Box>
              )}
            </Paper>
          </Stack>

          {/* Physical Actions Section */}
          <Stack gap="md">
            <Text size="lg" fw={600}>
              Physical Actions
            </Text>
            <MailActions
              mailId={mailId}
              status={mailItem.status}
              defaultForwardAddress={mailItem.defaultForwardAddress || ""}
              hasShreddingPin={mailItem.hasShreddingPin || false}
              hasFullScan={mailItem.hasFullScan}
              isForwarded={mailItem.isForwarded || false}
              pendingScanRequest={mailItem.pendingScanRequest}
              pendingForwardRequest={mailItem.pendingForwardRequest}
              pendingDisposeRequest={mailItem.pendingDisposeRequest}
            />
          </Stack>
        </Stack>
      </Tabs.Panel>

      {/* Scans Tab */}
      <Tabs.Panel value="scans" pt="md">
        <Stack gap="md">
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
