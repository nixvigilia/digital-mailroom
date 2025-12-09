"use client";

import {
  Title,
  Text,
  Stack,
  Paper,
  SimpleGrid,
  Button,
  Group,
  Badge,
} from "@mantine/core";
import {IconMapPin, IconArrowRight, IconBox} from "@tabler/icons-react";
import Link from "next/link";
import {useEffect, useState} from "react";
import {getMailingLocations} from "@/app/actions/operator-lockers";

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      const res = await getMailingLocations();
      if (res.success && res.data) {
        setLocations(res.data);
      }
      setLoading(false);
    }
    fetchLocations();
  }, []);

  if (loading) {
    return <Text>Loading locations...</Text>;
  }

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={2}>Mailing Locations</Title>
        <Text c="dimmed">Select a location to manage locker clusters</Text>
      </Stack>

      <SimpleGrid cols={{base: 1, md: 2, lg: 3}} spacing="lg">
        {locations.map((location) => (
          <Paper key={location.id} withBorder p="md" radius="md">
            <Stack justify="space-between" h="100%">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Title order={3} size="h4">
                    {location.name}
                  </Title>
                  <Badge color={location.is_active ? "green" : "gray"}>
                    {location.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Group>

                <Group gap="xs" c="dimmed" align="start">
                  <IconMapPin size={16} style={{marginTop: 4}} />
                  <Text size="sm" style={{flex: 1}}>
                    {location.address}, {location.city}, {location.province}
                  </Text>
                </Group>

                <Group gap="xs">
                  <IconBox size={16} />
                  <Text size="sm">{location._count.clusters} Clusters</Text>
                </Group>
              </Stack>

              <Button
                component={Link}
                href={`/operator/lockers/${location.id}`}
                variant="light"
                rightSection={<IconArrowRight size={16} />}
                mt="md"
              >
                Manage Clusters
              </Button>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
