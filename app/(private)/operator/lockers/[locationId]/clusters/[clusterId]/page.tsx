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
  NumberInput,
  Select,
  Badge,
} from "@mantine/core";
import {IconPlus, IconEdit, IconTrash, IconBox} from "@tabler/icons-react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {
  getMailboxes,
  createMailbox,
  updateMailbox,
  deleteMailbox,
} from "@/app/actions/operator-lockers";
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {notifications} from "@mantine/notifications";

export default function MailboxesPage() {
  const params = useParams();
  const locationId = params.locationId as string;
  const clusterId = params.clusterId as string;

  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, {open, close}] = useDisclosure(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      box_number: "",
      type: "STANDARD",
      width: 12,
      height: 3,
      depth: 15,
      dimension_unit: "INCH",
    },
    validate: {
      box_number: (value) =>
        value.length < 1 ? "Box number is required" : null,
      width: (value) => (value <= 0 ? "Width must be positive" : null),
      height: (value) => (value <= 0 ? "Height must be positive" : null),
      depth: (value) => (value <= 0 ? "Depth must be positive" : null),
    },
  });

  const fetchMailboxes = async () => {
    setLoading(true);
    const res = await getMailboxes(clusterId);
    if (res.success && res.data) {
      setMailboxes(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMailboxes();
  }, [clusterId]);

  const handleSubmit = async (values: typeof form.values) => {
    let res;
    const payload = {
      ...values,
      cluster_id: clusterId,
      // Convert strings to numbers if necessary (NumberInput usually handles this but good to be safe)
      width: Number(values.width),
      height: Number(values.height),
      depth: Number(values.depth),
    };

    if (editingId) {
      res = await updateMailbox(editingId, payload as any);
    } else {
      res = await createMailbox(payload as any);
    }

    if (res.success) {
      notifications.show({
        title: "Success",
        message: `Mailbox ${editingId ? "updated" : "created"} successfully`,
        color: "green",
      });
      close();
      fetchMailboxes();
    } else {
      notifications.show({
        title: "Error",
        message: res.error,
        color: "red",
      });
    }
  };

  const handleEdit = (mailbox: any) => {
    setEditingId(mailbox.id);
    form.setValues({
      box_number: mailbox.box_number,
      type: mailbox.type,
      width: Number(mailbox.width),
      height: Number(mailbox.height),
      depth: Number(mailbox.depth),
      dimension_unit: mailbox.dimension_unit,
    });
    open();
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset();
    open();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this mailbox?")) {
      const res = await deleteMailbox(id);
      if (res.success) {
        notifications.show({
          title: "Deleted",
          message: "Mailbox deleted",
          color: "blue",
        });
        fetchMailboxes();
      } else {
        notifications.show({title: "Error", message: res.error, color: "red"});
      }
    }
  };

  const items = [
    {title: "Lockers", href: "/operator/lockers"},
    {title: "Clusters", href: `/operator/lockers/${locationId}`},
    {title: "Mailboxes", href: "#"},
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
          <Title order={2}>Mailboxes</Title>
          <Text c="dimmed">Manage mailboxes and lockers for this cluster</Text>
        </Stack>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
          Add Mailbox
        </Button>
      </Group>

      <Paper withBorder radius="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Box Number</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Dimensions</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Assigned To</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {mailboxes.map((mb) => (
              <Table.Tr key={mb.id}>
                <Table.Td fw={700}>{mb.box_number}</Table.Td>
                <Table.Td>
                  <Badge
                    variant="outline"
                    color={mb.type === "PARCEL_LOCKER" ? "orange" : "blue"}
                  >
                    {mb.type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {Number(mb.width)} x {Number(mb.height)} x {Number(mb.depth)}{" "}
                  {mb.dimension_unit}
                </Table.Td>
                <Table.Td>
                  <Badge color={mb.is_occupied ? "red" : "green"} variant="dot">
                    {mb.is_occupied ? "Occupied" : "Available"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {mb.subscriptions && mb.subscriptions.length > 0 ? (
                    mb.subscriptions
                      .map((sub: any) => sub.profile.email)
                      .join(", ")
                  ) : (
                    <Text c="dimmed" size="sm">
                      -
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleEdit(mb)}
                    >
                      <IconEdit size={16} />
                    </Button>
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => handleDelete(mb.id)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {mailboxes.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6} ta="center">
                  No mailboxes found
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title={editingId ? "Edit Mailbox" : "New Mailbox"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Box Number"
              placeholder="A-001"
              required
              {...form.getInputProps("box_number")}
            />

            <Select
              label="Type"
              data={[
                {value: "STANDARD", label: "Standard Mailbox"},
                {value: "LARGE", label: "Large Mailbox"},
                {value: "PARCEL_LOCKER", label: "Parcel Locker"},
              ]}
              required
              {...form.getInputProps("type")}
            />

            <Group grow>
              <NumberInput
                label="Width"
                min={0}
                required
                {...form.getInputProps("width")}
              />
              <NumberInput
                label="Height"
                min={0}
                required
                {...form.getInputProps("height")}
              />
              <NumberInput
                label="Depth"
                min={0}
                required
                {...form.getInputProps("depth")}
              />
            </Group>

            <Select
              label="Unit"
              data={[
                {value: "CM", label: "Centimeters (CM)"},
                {value: "INCH", label: "Inches (IN)"},
              ]}
              required
              {...form.getInputProps("dimension_unit")}
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
