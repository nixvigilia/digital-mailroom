"use client";

import {useState} from "react";
import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Divider,
  ThemeIcon,
  Button,
  ActionIcon,
  Tooltip,
  Paper,
  SimpleGrid,
} from "@mantine/core";
import {
  IconMapPin,
  IconBox,
  IconExternalLink,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";

interface MailboxData {
  subscriptionId: string;
  planType: string;
  planName: string;
  billingCycle: string;
  mailbox: {
    id: string;
    box_number: string;
    type: string;
    width: number;
    height: number;
    depth: number;
    dimension_unit: string;
    is_occupied: boolean;
  };
  location: {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    map_url: string | null;
  };
  cluster: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface UserMailboxesCardProps {
  mailboxes: MailboxData[];
}

export function UserMailboxesCard({mailboxes}: UserMailboxesCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (mailboxes.length === 0) {
    return null;
  }

  const formatVirtualAddress = (item: MailboxData) => {
    return `${item.mailbox.box_number}, ${item.cluster.name}\n${item.location.address}\n${item.location.city}, ${item.location.province} ${item.location.postal_code}\n${item.location.country}`;
  };

  const formatAddress = (location: MailboxData["location"]) => {
    return `${location.address}, ${location.city}, ${location.province} ${location.postal_code}, ${location.country}`;
  };

  const formatDimensions = (mailbox: MailboxData["mailbox"]) => {
    return `${mailbox.width} x ${mailbox.height} x ${mailbox.depth} ${mailbox.dimension_unit}`;
  };

  const getMailboxTypeLabel = (type: string) => {
    switch (type) {
      case "STANDARD":
        return "Standard";
      case "LARGE":
        return "Large";
      case "PARCEL_LOCKER":
        return "Parcel Locker";
      default:
        return type;
    }
  };

  const getMailboxTypeColor = (type: string) => {
    switch (type) {
      case "STANDARD":
        return "blue";
      case "LARGE":
        return "green";
      case "PARCEL_LOCKER":
        return "orange";
      default:
        return "gray";
    }
  };

  const handleCopyAddress = async (item: MailboxData) => {
    const address = formatVirtualAddress(item);
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(item.subscriptionId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="lg">
      {mailboxes.map((item) => {
        const isCopied = copiedId === item.subscriptionId;
        const virtualAddress = formatVirtualAddress(item);

        return (
          <Card
            key={item.subscriptionId}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Stack gap="md" style={{flex: 1}}>
              {/* Header */}
              <Group justify="space-between" align="flex-start">
                <Group gap="xs" align="center">
                  <ThemeIcon
                    size="md"
                    radius="md"
                    variant="light"
                    color={getMailboxTypeColor(item.mailbox.type)}
                  >
                    <IconBox size={18} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">
                    {item.mailbox.box_number}
                  </Text>
                </Group>
                <Badge
                  size="sm"
                  variant="light"
                  color={getMailboxTypeColor(item.mailbox.type)}
                >
                  {getMailboxTypeLabel(item.mailbox.type)}
                </Badge>
              </Group>

              <Divider />

              {/* Location */}
              <Stack gap="xs">
                <Group gap="xs" align="center">
                  <IconMapPin size={16} />
                  <Text size="sm" fw={600}>
                    {item.location.name}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  {item.cluster.name}
                </Text>
              </Stack>

              {/* Virtual Address - Copy Section */}
              <Paper
                p="sm"
                withBorder
                style={{
                  backgroundColor: "var(--mantine-color-gray-0)",
                  borderStyle: "dashed",
                }}
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                      Virtual Address
                    </Text>
                    <Tooltip
                      label={isCopied ? "Copied!" : "Copy address"}
                      withArrow
                    >
                      <ActionIcon
                        variant="subtle"
                        color={isCopied ? "green" : "gray"}
                        onClick={() => handleCopyAddress(item)}
                        size="sm"
                      >
                        {isCopied ? (
                          <IconCheck size={16} />
                        ) : (
                          <IconCopy size={16} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <Text
                    size="xs"
                    style={{
                      fontFamily: "monospace",
                      whiteSpace: "pre-line",
                      lineHeight: 1.6,
                      userSelect: "text",
                      cursor: "text",
                    }}
                  >
                    {virtualAddress}
                  </Text>
                </Stack>
              </Paper>

              {/* Details */}
              <Stack gap="xs" style={{marginTop: "auto"}}>
                <Divider variant="dashed" />
                <Group justify="space-between" align="center">
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Dimensions
                    </Text>
                    <Text size="sm" fw={500}>
                      {formatDimensions(item.mailbox)}
                    </Text>
                  </Stack>
                  <Stack gap={2} align="flex-end">
                    <Text size="xs" c="dimmed">
                      Plan
                    </Text>
                    <Badge size="sm" variant="light" color="blue">
                      {item.planName}
                    </Badge>
                  </Stack>
                </Group>
                {item.location.map_url && (
                  <Button
                    component="a"
                    href={item.location.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="light"
                    size="xs"
                    fullWidth
                    leftSection={<IconExternalLink size={14} />}
                    mt="xs"
                  >
                    View on Map
                  </Button>
                )}
              </Stack>
            </Stack>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
