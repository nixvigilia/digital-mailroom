"use client";

import {useState} from "react";
import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Title,
  Divider,
  ThemeIcon,
  Button,
  ActionIcon,
  Tooltip,
  Paper,
} from "@mantine/core";
import {
  IconMapPin,
  IconBox,
  IconMail,
  IconArrowRight,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";

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
  mailItemCount: number;
}

interface UserMailboxesBriefProps {
  mailboxes: MailboxData[];
}

export function UserMailboxesBrief({mailboxes}: UserMailboxesBriefProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (mailboxes.length === 0) {
    return null;
  }

  // Show max 5 mailboxes
  const displayMailboxes = mailboxes.slice(0, 5);
  const hasMore = mailboxes.length > 5;

  const formatVirtualAddress = (item: MailboxData) => {
    return `${item.mailbox.box_number}, ${item.cluster.name}\n${item.location.address}\n${item.location.city}, ${item.location.province} ${item.location.postal_code}\n${item.location.country}`;
  };

  const formatFullAddress = (item: MailboxData) => {
    return `${item.location.address}, ${item.location.city}, ${item.location.province} ${item.location.postal_code}, ${item.location.country}`;
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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconMail size={20} />
            </ThemeIcon>
            <Title order={2} size="h3">
              My Mailboxes
            </Title>
          </Group>
          <Badge size="lg" variant="light" color="blue">
            {mailboxes.length}{" "}
            {mailboxes.length === 1 ? "Mailbox" : "Mailboxes"}
          </Badge>
        </Group>
        <Divider />
        <Stack gap="xs">
          {displayMailboxes.map((item) => {
            const isCopied = copiedId === item.subscriptionId;
            return (
              <Paper
                key={item.subscriptionId}
                p="md"
                withBorder
                style={{
                  borderColor: "var(--mantine-color-gray-3)",
                }}
              >
                <Group
                  justify="space-between"
                  align="flex-start"
                  gap="md"
                  wrap="nowrap"
                >
                  <Stack gap="xs" style={{flex: 1, minWidth: 0}}>
                    <Group gap="xs" align="center" wrap="nowrap">
                      <ThemeIcon
                        size="sm"
                        radius="md"
                        variant="light"
                        color={getMailboxTypeColor(item.mailbox.type)}
                      >
                        <IconBox size={14} />
                      </ThemeIcon>
                      <Text fw={600} size="sm" style={{whiteSpace: "nowrap"}}>
                        Box {item.mailbox.box_number}
                      </Text>
                      <Badge
                        size="xs"
                        variant="light"
                        color={getMailboxTypeColor(item.mailbox.type)}
                        style={{whiteSpace: "nowrap"}}
                      >
                        {getMailboxTypeLabel(item.mailbox.type)}
                      </Badge>
                    </Group>
                    <Stack gap={2}>
                      <Group gap={4} align="flex-start" wrap="nowrap">
                        <IconMapPin
                          size={14}
                          style={{marginTop: 2, flexShrink: 0}}
                        />
                        <Stack gap={2} style={{flex: 1, minWidth: 0}}>
                          <Text size="xs" fw={500}>
                            {item.location.name}
                          </Text>
                          <Text size="xs" c="dimmed" style={{lineHeight: 1.4}}>
                            {formatFullAddress(item)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Mailroom: {item.cluster.name}
                          </Text>
                          <Group gap="xs" align="center" mt={6}>
                            <ThemeIcon
                              size="sm"
                              radius="sm"
                              variant="light"
                              color="blue"
                            >
                              <IconMail size={14} />
                            </ThemeIcon>
                            <Text size="sm" fw={600} c="blue">
                              {item.mailItemCount}
                            </Text>
                            <Text size="xs" c="dimmed">
                              mail item{item.mailItemCount !== 1 ? "s" : ""}{" "}
                              stored
                            </Text>
                          </Group>
                        </Stack>
                      </Group>
                    </Stack>
                  </Stack>
                  <Tooltip
                    label={isCopied ? "Copied!" : "Copy address"}
                    withArrow
                  >
                    <ActionIcon
                      variant="subtle"
                      color={isCopied ? "green" : "gray"}
                      onClick={() => handleCopyAddress(item)}
                      size="md"
                      style={{flexShrink: 0}}
                    >
                      {isCopied ? (
                        <IconCheck size={16} />
                      ) : (
                        <IconCopy size={16} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Paper>
            );
          })}
        </Stack>
        {hasMore && (
          <>
            <Divider />
            <Group justify="center">
              <Button
                component={Link}
                href="/app/mailboxes"
                variant="light"
                rightSection={<IconArrowRight size={16} />}
                size="sm"
              >
                View All Mailboxes ({mailboxes.length})
              </Button>
            </Group>
          </>
        )}
        {!hasMore && mailboxes.length > 0 && (
          <>
            <Divider />
            <Group justify="center">
              <Button
                component={Link}
                href="/app/mailboxes"
                variant="subtle"
                rightSection={<IconArrowRight size={16} />}
                size="sm"
              >
                View Details
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Card>
  );
}
