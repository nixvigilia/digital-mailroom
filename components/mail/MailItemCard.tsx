"use client";

import {
  Paper,
  Group,
  Stack,
  Text,
  Badge,
  Button,
  Image,
  Tooltip,
  ActionIcon,
  Box,
} from "@mantine/core";
import {
  IconMail,
  IconEye,
  IconDownload,
  IconTag,
  IconCalendar,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";

export interface MailItem {
  id: string;
  receivedAt: Date;
  sender?: string;
  subject?: string;
  status: "received" | "scanned" | "processed" | "archived";
  envelopeScanUrl?: string;
  hasFullScan: boolean;
  tags?: string[];
  category?: string;
  department?: string;
  assignedTo?: string | null;
}

interface MailItemCardProps {
  item: MailItem;
  onView?: (id: string) => void;
}

export function MailItemCard({item, onView}: MailItemCardProps) {
  const statusColors: Record<string, string> = {
    received: "blue",
    scanned: "green",
    processed: "gray",
    archived: "orange",
  };

  return (
    <Paper
      withBorder
      shadow="sm"
      p={{base: "sm", sm: "md"}}
      radius="md"
      style={{cursor: "pointer", height: "100%"}}
      component={Link}
      href={item.department ? `/business/inbox/${item.id}` : `/user/inbox/${item.id}`}
    >
      {/* Desktop Layout - Grid View */}
      <Stack gap="sm" visibleFrom="sm">
        {/* Envelope Preview - Desktop Grid: Full Width */}
        <Box
          style={{
            width: "100%",
            height: 180,
            borderRadius: "var(--mantine-radius-sm)",
            overflow: "hidden",
            backgroundColor: "var(--mantine-color-gray-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {item.envelopeScanUrl ? (
            <Image
              src={item.envelopeScanUrl}
              alt="Envelope scan"
              style={{width: "100%", height: "100%", objectFit: "cover"}}
            />
          ) : (
            <IconMail size={40} color="var(--mantine-color-gray-5)" />
          )}
        </Box>

        {/* Content - Desktop Grid */}
        <Stack gap="xs" style={{flex: 1, minWidth: 0}}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4} style={{flex: 1, minWidth: 0}}>
              {item.sender && (
                <Group gap="xs" wrap="nowrap">
                  <IconUser size={14} color="var(--mantine-color-gray-6)" />
                  <Text size="sm" fw={500} truncate>
                    {item.sender}
                  </Text>
                </Group>
              )}
              {item.subject && (
                <Text size="md" fw={600} lineClamp={1}>
                  {item.subject}
                </Text>
              )}
              <Group gap="xs" wrap="nowrap">
                <IconCalendar size={14} color="var(--mantine-color-gray-6)" />
                <Text size="xs" c="dimmed">
                  {new Date(item.receivedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Group>
            </Stack>
            <Badge color={statusColors[item.status]} variant="light" size="sm">
              {item.status}
            </Badge>
          </Group>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <Group gap="xs">
              <IconTag size={14} color="var(--mantine-color-gray-6)" />
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" size="xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Text size="xs" c="dimmed">
                  +{item.tags.length - 3} more
                </Text>
              )}
            </Group>
          )}

          {/* Actions */}
          <Group gap="xs" mt="xs">
            <Tooltip label="View Details">
              <ActionIcon
                variant="light"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  if (onView) onView(item.id);
                  else {
                    const href = item.department ? `/business/inbox/${item.id}` : `/user/inbox/${item.id}`;
                    window.location.href = href;
                  }
                }}
              >
                <IconEye size={16} />
              </ActionIcon>
            </Tooltip>
            {item.hasFullScan && (
              <Tooltip label="Download Full Scan">
                <ActionIcon variant="light" size="sm" color="green">
                  <IconDownload size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Stack>
      </Stack>

      {/* Mobile Layout */}
      <Stack gap="sm" hiddenFrom="sm">
        {/* Envelope Preview - Mobile: Full Width */}
        <Box
          style={{
            width: "100%",
            height: 200,
            flexShrink: 0,
            borderRadius: "var(--mantine-radius-sm)",
            overflow: "hidden",
            backgroundColor: "var(--mantine-color-gray-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {item.envelopeScanUrl ? (
            <Image
              src={item.envelopeScanUrl}
              alt="Envelope scan"
              style={{width: "100%", height: "100%", objectFit: "cover"}}
            />
          ) : (
            <IconMail size={40} color="var(--mantine-color-gray-5)" />
          )}
        </Box>

        {/* Content - Mobile */}
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4} style={{flex: 1, minWidth: 0}}>
              {item.sender && (
                <Group gap="xs" wrap="nowrap">
                  <IconUser size={14} color="var(--mantine-color-gray-6)" />
                  <Text size="sm" fw={500} truncate>
                    {item.sender}
                  </Text>
                </Group>
              )}
              {item.subject && (
                <Text size="md" fw={600} lineClamp={2}>
                  {item.subject}
                </Text>
              )}
              <Group gap="xs" wrap="nowrap">
                <IconCalendar size={14} color="var(--mantine-color-gray-6)" />
                <Text size="xs" c="dimmed">
                  {new Date(item.receivedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Group>
            </Stack>
            <Badge color={statusColors[item.status]} variant="light" size="sm">
              {item.status}
            </Badge>
          </Group>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <Group gap="xs">
              <IconTag size={14} color="var(--mantine-color-gray-6)" />
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" size="xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Text size="xs" c="dimmed">
                  +{item.tags.length - 3} more
                </Text>
              )}
            </Group>
          )}

          {/* Actions */}
          <Group gap="xs" mt="xs">
            <Tooltip label="View Details">
              <ActionIcon
                variant="light"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  if (onView) onView(item.id);
                  else {
                    const href = item.department ? `/business/inbox/${item.id}` : `/user/inbox/${item.id}`;
                    window.location.href = href;
                  }
                }}
              >
                <IconEye size={16} />
              </ActionIcon>
            </Tooltip>
            {item.hasFullScan && (
              <Tooltip label="Download Full Scan">
                <ActionIcon variant="light" size="sm" color="green">
                  <IconDownload size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
}
