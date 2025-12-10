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
  Modal,
  TextInput,
  Switch,
  ActionIcon,
  Divider,
} from "@mantine/core";
import {
  IconMapPin,
  IconArrowRight,
  IconBox,
  IconPlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import {useEffect, useState} from "react";
import {
  getMailingLocations,
  createMailingLocation,
  updateMailingLocation,
  deleteMailingLocation,
} from "@/app/actions/operator-lockers";
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {notifications} from "@mantine/notifications";

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, {open, close}] = useDisclosure(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clusters, setClusters] = useState<
    Array<{name: string; description: string}>
  >([{name: "", description: ""}]);

  const form = useForm({
    initialValues: {
      name: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      country: "Philippines",
      image_url: "",
      map_url: "",
      is_active: true,
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
      address: (value) => (value.length < 1 ? "Address is required" : null),
      city: (value) => (value.length < 1 ? "City is required" : null),
      province: (value) => (value.length < 1 ? "Province is required" : null),
      postal_code: (value) =>
        value.length < 1 ? "Postal code is required" : null,
    },
  });

  const fetchLocations = async () => {
    setLoading(true);
    const res = await getMailingLocations();
    if (res.success && res.data) {
      setLocations(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    // Validate clusters
    const validClusters = clusters.filter((c) => c.name.trim().length > 0);
    if (validClusters.length === 0) {
      notifications.show({
        title: "Error",
        message: "At least one mailbox cluster must be assigned",
        color: "red",
      });
      return;
    }

    if (editingId) {
      // Update location (clusters are managed separately)
      const res = await updateMailingLocation(editingId, values);
      if (res.success) {
        notifications.show({
          title: "Success",
          message: "Location updated successfully",
          color: "green",
        });
        close();
        fetchLocations();
      } else {
        notifications.show({
          title: "Error",
          message: res.error || "Failed to update location",
          color: "red",
        });
      }
    } else {
      // Create location with clusters
      const res = await createMailingLocation(
        values,
        validClusters.map((c) => ({
          name: c.name,
          description: c.description || undefined,
        }))
      );
      if (res.success) {
        notifications.show({
          title: "Success",
          message: "Location created successfully",
          color: "green",
        });
        close();
        fetchLocations();
      } else {
        notifications.show({
          title: "Error",
          message: res.error || "Failed to create location",
          color: "red",
        });
      }
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset();
    setClusters([{name: "", description: ""}]);
    open();
  };

  const handleEdit = (location: any) => {
    setEditingId(location.id);
    form.setValues({
      name: location.name,
      address: location.address,
      city: location.city,
      province: location.province,
      postal_code: location.postal_code,
      country: location.country,
      image_url: location.image_url || "",
      map_url: location.map_url || "",
      is_active: location.is_active,
    });
    // Note: Clusters are managed separately on the clusters page
    open();
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This will also delete all associated clusters and mailboxes.`
      )
    ) {
      const res = await deleteMailingLocation(id);
      if (res.success) {
        notifications.show({
          title: "Deleted",
          message: "Location deleted successfully",
          color: "blue",
        });
        fetchLocations();
      } else {
        notifications.show({
          title: "Error",
          message: res.error || "Failed to delete location",
          color: "red",
        });
      }
    }
  };

  const addCluster = () => {
    setClusters([...clusters, {name: "", description: ""}]);
  };

  const removeCluster = (index: number) => {
    if (clusters.length > 1) {
      setClusters(clusters.filter((_, i) => i !== index));
    } else {
      notifications.show({
        title: "Error",
        message: "At least one cluster is required",
        color: "red",
      });
    }
  };

  const updateCluster = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const updated = [...clusters];
    updated[index] = {...updated[index], [field]: value};
    setClusters(updated);
  };

  if (loading) {
    return <Text>Loading locations...</Text>;
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Stack gap="xs">
          <Title order={2}>Mailing Locations</Title>
          <Text c="dimmed">
            Manage mailing locations and their mailbox clusters
          </Text>
        </Stack>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
          Add Location
        </Button>
      </Group>

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
                  <Text size="sm">
                    {location.clusters?.length || location._count.clusters}{" "}
                    Clusters
                  </Text>
                </Group>
              </Stack>

              <Group gap="xs" mt="md">
                <Button
                  component={Link}
                  href={`/operator/lockers/${location.id}`}
                  variant="light"
                  rightSection={<IconArrowRight size={16} />}
                  style={{flex: 1}}
                >
                  Manage Clusters
                </Button>
                <ActionIcon
                  variant="subtle"
                  onClick={() => handleEdit(location)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleDelete(location.id, location.name)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>

      <Modal
        opened={opened}
        onClose={close}
        title={editingId ? "Edit Location" : "New Location"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Main Office"
              required
              {...form.getInputProps("name")}
            />

            <TextInput
              label="Address"
              placeholder="123 Main Street"
              required
              {...form.getInputProps("address")}
            />

            <Group grow>
              <TextInput
                label="City"
                placeholder="Manila"
                required
                {...form.getInputProps("city")}
              />
              <TextInput
                label="Province"
                placeholder="Metro Manila"
                required
                {...form.getInputProps("province")}
              />
            </Group>

            <Group grow>
              <TextInput
                label="Postal Code"
                placeholder="1000"
                required
                {...form.getInputProps("postal_code")}
              />
              <TextInput
                label="Country"
                placeholder="Philippines"
                {...form.getInputProps("country")}
              />
            </Group>

            <TextInput
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              {...form.getInputProps("image_url")}
            />

            <TextInput
              label="Map URL"
              placeholder="https://maps.google.com/..."
              {...form.getInputProps("map_url")}
            />

            <Switch
              label="Active"
              {...form.getInputProps("is_active", {type: "checkbox"})}
            />

            {!editingId && (
              <>
                <Divider label="Mailbox Clusters" labelPosition="left" />
                <Text size="sm" c="dimmed">
                  At least one cluster must be assigned to the location
                </Text>
                {clusters.map((cluster, index) => (
                  <Paper key={index} withBorder p="md" radius="md">
                    <Stack gap="sm">
                      <Group>
                        <TextInput
                          placeholder="Cluster A"
                          label="Cluster Name"
                          required
                          style={{flex: 1}}
                          value={cluster.name}
                          onChange={(e) =>
                            updateCluster(index, "name", e.target.value)
                          }
                        />
                        {clusters.length > 1 && (
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => removeCluster(index)}
                            mt={24}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                      <TextInput
                        placeholder="Optional description"
                        label="Description"
                        value={cluster.description}
                        onChange={(e) =>
                          updateCluster(index, "description", e.target.value)
                        }
                      />
                    </Stack>
                  </Paper>
                ))}
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={addCluster}
                >
                  Add Another Cluster
                </Button>
              </>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update" : "Create"} Location
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
