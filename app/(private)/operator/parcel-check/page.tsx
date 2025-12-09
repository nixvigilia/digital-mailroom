"use client";

import {
  Title,
  Text,
  Stack,
  Paper,
  Button,
  Group,
  NumberInput,
  Select,
  Alert,
  SimpleGrid,
  ThemeIcon,
} from "@mantine/core";
import {useForm} from "@mantine/form";
import {IconBox, IconCheck, IconX, IconRuler} from "@tabler/icons-react";
import {useState, useEffect} from "react";
import {
  getMailingLocations,
  getClusters,
  getMailboxes,
  validateParcelSize,
} from "@/app/actions/operator-lockers";

export default function ParcelCheckPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [mailboxes, setMailboxes] = useState<any[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMailingLocations().then((res) => res.data && setLocations(res.data));
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      getClusters(selectedLocation).then(
        (res) => res.data && setClusters(res.data)
      );
      setClusters([]);
      setMailboxes([]);
      setSelectedCluster(null);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedCluster) {
      getMailboxes(selectedCluster).then(
        (res) => res.data && setMailboxes(res.data)
      );
      setMailboxes([]);
    }
  }, [selectedCluster]);

  const form = useForm({
    initialValues: {
      mailbox_id: "",
      width: 0,
      height: 0,
      depth: 0,
      unit: "CM" as "CM" | "INCH",
    },
    validate: {
      mailbox_id: (value) => (value ? null : "Please select a mailbox"),
      width: (value) => (value > 0 ? null : "Width must be greater than 0"),
      height: (value) => (value > 0 ? null : "Height must be greater than 0"),
      depth: (value) => (value > 0 ? null : "Depth must be greater than 0"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setResult(null);
    const res = await validateParcelSize(
      {
        width: values.width,
        height: values.height,
        depth: values.depth,
        unit: values.unit,
      },
      values.mailbox_id
    );
    setResult(res);
    setLoading(false);
  };

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={2}>Parcel Fit Check</Title>
        <Text c="dimmed">Verify if a parcel fits into a specific locker</Text>
      </Stack>

      <SimpleGrid cols={{base: 1, md: 2}} spacing="lg">
        <Paper withBorder p="xl" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Select
                label="Location"
                placeholder="Select location"
                data={locations.map((l) => ({value: l.id, label: l.name}))}
                value={selectedLocation}
                onChange={setSelectedLocation}
                searchable
              />

              <Select
                label="Cluster"
                placeholder="Select cluster"
                data={clusters.map((c) => ({value: c.id, label: c.name}))}
                value={selectedCluster}
                onChange={setSelectedCluster}
                disabled={!selectedLocation}
                searchable
              />

              <Select
                label="Mailbox / Locker"
                placeholder="Select mailbox"
                data={mailboxes.map((m) => ({
                  value: m.id,
                  label: `${m.box_number} (${m.type})`,
                }))}
                disabled={!selectedCluster}
                searchable
                {...form.getInputProps("mailbox_id")}
              />

              <Title order={4} size="h5" mt="sm">
                Parcel Dimensions
              </Title>

              <Group grow>
                <NumberInput
                  label="Width"
                  min={0}
                  {...form.getInputProps("width")}
                />
                <NumberInput
                  label="Height"
                  min={0}
                  {...form.getInputProps("height")}
                />
                <NumberInput
                  label="Depth"
                  min={0}
                  {...form.getInputProps("depth")}
                />
              </Group>

              <Select
                label="Unit"
                data={["CM", "INCH"]}
                {...form.getInputProps("unit")}
              />

              <Button
                type="submit"
                loading={loading}
                mt="md"
                leftSection={<IconRuler size={16} />}
              >
                Check Fit
              </Button>
            </Stack>
          </form>
        </Paper>

        <Stack>
          {result && (
            <Paper
              withBorder
              p="xl"
              radius="md"
              bg={result.fits ? "green.0" : "red.0"}
            >
              <Stack align="center" gap="md">
                <ThemeIcon
                  size={60}
                  radius="xl"
                  color={result.fits ? "green" : "red"}
                >
                  {result.fits ? <IconCheck size={32} /> : <IconX size={32} />}
                </ThemeIcon>

                <Title order={3} c={result.fits ? "green.9" : "red.9"}>
                  {result.fits ? "Parcel Fits!" : "Parcel Too Large"}
                </Title>

                {result.details && (
                  <Stack w="100%" gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Parcel ({result.details.parcel.unit})
                      </Text>
                      <Text fw={500}>
                        {result.details.parcel.width} x{" "}
                        {result.details.parcel.height} x{" "}
                        {result.details.parcel.depth}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Locker ({result.details.mailbox.unit})
                      </Text>
                      <Text fw={500}>
                        {result.details.mailbox.width} x{" "}
                        {result.details.mailbox.height} x{" "}
                        {result.details.mailbox.depth}
                      </Text>
                    </Group>
                  </Stack>
                )}
              </Stack>
            </Paper>
          )}

          {!result && (
            <Paper
              withBorder
              p="xl"
              radius="md"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Stack align="center" gap="xs" c="dimmed">
                <IconBox size={48} stroke={1.5} />
                <Text>Select a locker and enter dimensions to check</Text>
              </Stack>
            </Paper>
          )}
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
