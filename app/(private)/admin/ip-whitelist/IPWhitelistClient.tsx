"use client";

import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  Table,
  ActionIcon,
  Tooltip,
  Modal,
  TextInput,
  Textarea,
  Badge,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconShield,
  IconAlertCircle,
} from "@tabler/icons-react";
import {useState} from "react";
import {useDisclosure} from "@mantine/hooks";
import {notifications} from "@mantine/notifications";
import useSWR from "swr";
import {
  getAllowedIPs,
  createAllowedIP,
  updateAllowedIP,
  deleteAllowedIP,
  AllowedIPData,
} from "@/app/actions/admin-ip-whitelist";

export default function IPWhitelistClient() {
  const [createOpened, {open: openCreate, close: closeCreate}] =
    useDisclosure(false);
  const [editOpened, {open: openEdit, close: closeEdit}] =
    useDisclosure(false);
  const [deleteOpened, {open: openDelete, close: closeDelete}] =
    useDisclosure(false);
  const [selectedIP, setSelectedIP] = useState<AllowedIPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ip_address: "",
    description: "",
  });

  // Fetcher function for SWR
  const fetcher = async () => {
    const result = await getAllowedIPs();
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch allowed IPs");
    }
    return result;
  };

  const {data, error, isLoading, mutate} = useSWR("allowed-ips", fetcher, {
    onError: (err: Error) => {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    },
  });

  const allowedIPs = data?.data || [];

  const handleOpenCreate = () => {
    setFormData({ip_address: "", description: ""});
    openCreate();
  };

  const handleOpenEdit = (ip: AllowedIPData) => {
    setSelectedIP(ip);
    setFormData({
      ip_address: ip.ip_address,
      description: ip.description || "",
    });
    openEdit();
  };

  const handleOpenDelete = (ip: AllowedIPData) => {
    setSelectedIP(ip);
    openDelete();
  };

  const handleCreate = async () => {
    if (!formData.ip_address.trim()) {
      notifications.show({
        title: "Error",
        message: "IP address is required",
        color: "red",
      });
      return;
    }

    setLoading(true);
    const formDataObj = new FormData();
    formDataObj.append("ip_address", formData.ip_address.trim());
    formDataObj.append("description", formData.description.trim());

    try {
      const result = await createAllowedIP(formDataObj);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        closeCreate();
        setFormData({ip_address: "", description: ""});
        mutate();
      } else {
        notifications.show({
          title: "Error",
          message: result.message,
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.ip_address.trim()) {
      notifications.show({
        title: "Error",
        message: "IP address is required",
        color: "red",
      });
      return;
    }

    if (!selectedIP) return;

    setLoading(true);
    const formDataObj = new FormData();
    formDataObj.append("id", selectedIP.id);
    formDataObj.append("ip_address", formData.ip_address.trim());
    formDataObj.append("description", formData.description.trim());

    try {
      const result = await updateAllowedIP(formDataObj);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        closeEdit();
        setSelectedIP(null);
        setFormData({ip_address: "", description: ""});
        mutate();
      } else {
        notifications.show({
          title: "Error",
          message: result.message,
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedIP) return;

    setLoading(true);
    try {
      const result = await deleteAllowedIP(selectedIP.id);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        closeDelete();
        setSelectedIP(null);
        mutate();
      } else {
        notifications.show({
          title: "Error",
          message: result.message,
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Stack gap={4}>
          <Group gap="sm" align="center">
            <IconShield size={32} color="var(--mantine-color-blue-6)" />
            <Title order={1}>IP Whitelist Management</Title>
          </Group>
          <Text c="dimmed" size="lg">
            Manage IP addresses allowed to access the admin portal
          </Text>
        </Stack>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={handleOpenCreate}
        >
          Add IP Address
        </Button>
      </Group>

      {/* Info Alert */}
      <Paper withBorder p="md" radius="md" style={{backgroundColor: "var(--mantine-color-blue-0)"}}>
        <Group gap="sm">
          <IconAlertCircle size={20} color="var(--mantine-color-blue-6)" />
          <Text size="sm" c="blue">
            Only whitelisted IP addresses can access the admin portal. Make sure
            to add your IP address before accessing from a new location.
          </Text>
        </Group>
      </Paper>

      {/* IP Addresses Table */}
      <Paper withBorder p="xl" radius="md">
        {isLoading ? (
          <Text c="dimmed" ta="center" py="xl">
            Loading...
          </Text>
        ) : error ? (
          <Text c="red" ta="center" py="xl">
            Failed to load IP addresses
          </Text>
        ) : allowedIPs.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No IP addresses in whitelist. Add your first IP address to get
            started.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={600}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>IP Address</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Created At</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {allowedIPs.map((ip) => (
                  <Table.Tr key={ip.id}>
                    <Table.Td>
                      <Text fw={500} size="sm" ff="monospace">
                        {ip.ip_address}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={ip.description ? "dark" : "dimmed"}>
                        {ip.description || "No description"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {new Date(ip.created_at).toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleOpenEdit(ip)}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleOpenDelete(ip)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      {/* Create Modal */}
      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title="Add IP Address"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="IP Address"
            placeholder="192.168.1.1 or 2001:0db8:85a3::8a2e:0370:7334"
            required
            value={formData.ip_address}
            onChange={(e) =>
              setFormData({...formData, ip_address: e.target.value})
            }
            description="Enter a valid IPv4 or IPv6 address"
          />
          <Textarea
            label="Description (Optional)"
            placeholder="e.g., Office IP, Home IP, etc."
            value={formData.description}
            onChange={(e) =>
              setFormData({...formData, description: e.target.value})
            }
            rows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeCreate}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={loading}>
              Add IP Address
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editOpened}
        onClose={closeEdit}
        title="Edit IP Address"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="IP Address"
            placeholder="192.168.1.1 or 2001:0db8:85a3::8a2e:0370:7334"
            required
            value={formData.ip_address}
            onChange={(e) =>
              setFormData({...formData, ip_address: e.target.value})
            }
            description="Enter a valid IPv4 or IPv6 address"
          />
          <Textarea
            label="Description (Optional)"
            placeholder="e.g., Office IP, Home IP, etc."
            value={formData.description}
            onChange={(e) =>
              setFormData({...formData, description: e.target.value})
            }
            rows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} loading={loading}>
              Update IP Address
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Delete IP Address"
        size="md"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to remove{" "}
            <Text component="span" fw={600} ff="monospace">
              {selectedIP?.ip_address}
            </Text>{" "}
            from the whitelist?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone. The IP address will no longer be able
            to access the admin portal.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeDelete}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

