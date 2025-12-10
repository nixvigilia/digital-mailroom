"use client";

import {
  Title,
  Text,
  Stack,
  Paper,
  Button,
  Group,
  Table,
  Breadcrumbs,
  Anchor,
  Modal,
  TextInput,
  Textarea,
  Alert,
} from "@mantine/core";
import {IconPlus, IconEdit, IconTrash} from "@tabler/icons-react";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {
  getClusters,
  createCluster,
  updateCluster,
  deleteCluster,
} from "@/app/actions/operator-lockers";
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {notifications} from "@mantine/notifications";

export default function ClustersPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.locationId as string;

  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, {open, close}] = useDisclosure(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
    },
  });

  const fetchClusters = async () => {
    setLoading(true);
    const res = await getClusters(locationId);
    if (res.success && res.data) {
      setClusters(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClusters();
  }, [locationId]);

  const handleSubmit = async (values: typeof form.values) => {
    let res;
    if (editingId) {
      res = await updateCluster(editingId, values);
    } else {
      res = await createCluster({...values, mailing_location_id: locationId});
    }

    if (res.success) {
      notifications.show({
        title: "Success",
        message: `Cluster ${editingId ? "updated" : "created"} successfully`,
        color: "green",
      });
      close();
      fetchClusters();
    } else {
      notifications.show({
        title: "Error",
        message: res.error,
        color: "red",
      });
    }
  };

  const handleEdit = (cluster: any) => {
    setEditingId(cluster.id);
    form.setValues({
      name: cluster.name,
      description: cluster.description || "",
    });
    open();
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset();
    open();
  };

  const handleDelete = async (id: string) => {
    // Check if this is the last cluster
    if (clusters.length <= 1) {
      notifications.show({
        title: "Error",
        message:
          "Cannot delete the last cluster. Each mailing location must have at least one cluster assigned.",
        color: "red",
      });
      return;
    }

    if (confirm("Are you sure you want to delete this cluster?")) {
      const res = await deleteCluster(id, locationId);
      if (res.success) {
        notifications.show({
          title: "Deleted",
          message: "Cluster deleted",
          color: "blue",
        });
        fetchClusters();
      } else {
        notifications.show({title: "Error", message: res.error, color: "red"});
      }
    }
  };

  const items = [
    {title: "Lockers", href: "/operator/lockers"},
    {title: "Clusters", href: "#"},
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  if (loading) return <Text>Loading...</Text>;

  return (
    <Stack gap="xl">
      <Breadcrumbs>{items}</Breadcrumbs>

      <Group justify="space-between">
        <Stack gap="xs">
          <Title order={2}>Mailbox Clusters</Title>
          <Text c="dimmed">Manage clusters for this location</Text>
        </Stack>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
          Add Cluster
        </Button>
      </Group>

      {clusters.length === 1 && (
        <Alert color="yellow" title="Minimum Cluster Requirement">
          This location has only one cluster. Each mailing location must have at
          least one cluster assigned, so this cluster cannot be deleted.
        </Alert>
      )}

      <Paper withBorder radius="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Mailboxes</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {clusters.map((cluster) => (
              <Table.Tr key={cluster.id}>
                <Table.Td fw={500}>
                  <Anchor
                    component={Link}
                    href={`/operator/lockers/${locationId}/clusters/${cluster.id}`}
                  >
                    {cluster.name}
                  </Anchor>
                </Table.Td>
                <Table.Td>{cluster.description}</Table.Td>
                <Table.Td>{cluster._count.mailboxes}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleEdit(cluster)}
                    >
                      <IconEdit size={16} />
                    </Button>
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => handleDelete(cluster.id)}
                      disabled={clusters.length === 1}
                      title={
                        clusters.length === 1
                          ? "Cannot delete the last cluster"
                          : "Delete cluster"
                      }
                    >
                      <IconTrash size={16} />
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {clusters.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={4} ta="center">
                  No clusters found
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title={editingId ? "Edit Cluster" : "New Cluster"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Cluster A"
              required
              {...form.getInputProps("name")}
            />
            <Textarea
              label="Description"
              placeholder="Optional description"
              {...form.getInputProps("description")}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
