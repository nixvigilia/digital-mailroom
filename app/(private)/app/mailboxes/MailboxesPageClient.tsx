"use client";

import {useMemo} from "react";
import {Title, Text, Stack, Group, Badge, Alert, Divider} from "@mantine/core";
import {IconInfoCircle, IconMapPin} from "@tabler/icons-react";
import {UserMailboxesCard} from "@/components/user/UserMailboxesCard";

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

interface MailboxesPageClientProps {
  allMailboxes: MailboxData[];
}

export function MailboxesPageClient({allMailboxes}: MailboxesPageClientProps) {
  // Group mailboxes by location
  const mailboxesByLocation = useMemo(() => {
    const grouped = new Map<string, MailboxData[]>();

    allMailboxes.forEach((mailbox) => {
      const locationId = mailbox.location.id;
      if (!grouped.has(locationId)) {
        grouped.set(locationId, []);
      }
      grouped.get(locationId)!.push(mailbox);
    });

    return Array.from(grouped.entries()).map(([locationId, mailboxes]) => ({
      location: mailboxes[0].location,
      mailboxes,
    }));
  }, [allMailboxes]);

  if (allMailboxes.length === 0) {
    return (
      <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
        <Stack gap="xs">
          <Title
            order={1}
            fw={800}
            style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
          >
            My Mailboxes
          </Title>
          <Text c="dimmed" size="lg" visibleFrom="sm">
            View and manage your assigned mailboxes and parcel lockers
          </Text>
          <Text c="dimmed" size="sm" hiddenFrom="sm">
            View and manage your assigned mailboxes and parcel lockers
          </Text>
        </Stack>

        <Alert
          icon={<IconInfoCircle size={20} />}
          title="No Mailboxes Assigned"
          color="blue"
        >
          <Text size="sm">
            You don't have any mailboxes assigned yet. Subscribe to a plan to
            get your mailbox assigned.
          </Text>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap="xs">
            <Title
              order={1}
              fw={800}
              style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
            >
              My Mailboxes
            </Title>
            <Text c="dimmed" size="lg" visibleFrom="sm">
              View and manage your assigned mailboxes and parcel lockers
            </Text>
            <Text c="dimmed" size="sm" hiddenFrom="sm">
              View and manage your assigned mailboxes and parcel lockers
            </Text>
          </Stack>
          <Badge size="lg" variant="light" color="blue">
            {allMailboxes.length}{" "}
            {allMailboxes.length === 1 ? "Mailbox" : "Mailboxes"}
          </Badge>
        </Group>
      </Stack>

      <Stack gap="xl">
        {mailboxesByLocation.map(({location, mailboxes}) => (
          <Stack key={location.id} gap="md">
            <Group gap="sm" align="center">
              <IconMapPin size={20} />
              <Stack gap={2}>
                <Title order={2} size="h4">
                  {location.name}
                </Title>
                <Text size="sm" c="dimmed">
                  {location.address}, {location.city}, {location.province}{" "}
                  {location.postal_code}, {location.country}
                </Text>
              </Stack>
            </Group>
            <Divider />
            <UserMailboxesCard mailboxes={mailboxes} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
