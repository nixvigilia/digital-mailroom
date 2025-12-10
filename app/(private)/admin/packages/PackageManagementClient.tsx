"use client";

import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  Table,
  Badge,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
  Tooltip,
  Modal,
  LoadingOverlay,
  Textarea,
  TagsInput,
  Switch,
  Grid,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconPackage,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  PackageData,
} from "@/app/actions/admin-packages";

// Initial state for the form
const initialFormState = {
  name: "",
  plan_type: "",
  intended_for: "",
  description: "",
  price_monthly: 0,
  price_quarterly: null as number | null,
  price_yearly: null as number | null,
  features: [] as string[],
  not_included: [] as string[],
  max_scanned_pages: null as number | null,
  retention_days: null as number | null,
  max_storage_items: null as number | null,
  digital_storage_mb: null as number | null,
  max_team_members: null as number | null,
  is_active: true,
  is_featured: false,
  display_order: 0,
  cashback_percentage: 5,
};

export default function PackageManagementClient() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState(initialFormState);

  // Fetch Packages
  const fetchPackages = async () => {
    setLoading(true);
    const result = await getPackages();
    if (result.success && result.data) {
        // Cast the data to PackageData[] because the Prisma return type might have Decimal
        // and we need to handle that or ensure our server action converts it.
        // For simplicity in this client, we assume the server action handled serialization.
        // NOTE: Prisma Decimal is not directly JSON serializable, so the server action *should* have handled it.
        // Let's assume for now the server action returns numbers or strings that can be cast.
        // If not, we might see errors. Ideally getPackages returns plain objects.
      setPackages(result.data as unknown as PackageData[]);
    } else {
      notifications.show({
        title: "Error",
        message: result.message || "Failed to fetch packages",
        color: "red",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    openModal();
  };

  const handleOpenEdit = (pkg: PackageData) => {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name,
      plan_type: pkg.plan_type,
      intended_for: pkg.intended_for || "",
      description: pkg.description || "",
      price_monthly: Number(pkg.price_monthly),
      price_quarterly: pkg.price_quarterly ? Number(pkg.price_quarterly) : null,
      price_yearly: pkg.price_yearly ? Number(pkg.price_yearly) : null,
      features: pkg.features,
      not_included: pkg.not_included,
      max_scanned_pages: pkg.max_scanned_pages,
      retention_days: pkg.retention_days,
      max_storage_items: pkg.max_storage_items,
      digital_storage_mb: pkg.digital_storage_mb,
      max_team_members: pkg.max_team_members,
      is_active: pkg.is_active,
      is_featured: pkg.is_featured,
      display_order: pkg.display_order,
      cashback_percentage: Number(pkg.cashback_percentage),
    });
    openModal();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.plan_type) {
      notifications.show({
        title: "Validation Error",
        message: "Name and Plan Type are required",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    let result;

    if (editingId) {
      result = await updatePackage(editingId, formData);
    } else {
      result = await createPackage(formData);
    }

    if (result.success) {
      notifications.show({
        title: "Success",
        message: result.message,
        color: "green",
      });
      closeModal();
      fetchPackages();
    } else {
      notifications.show({
        title: "Error",
        message: result.message,
        color: "red",
      });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    setLoading(true);
    const result = await deletePackage(id);
    if (result.success) {
      notifications.show({
        title: "Success",
        message: result.message,
        color: "green",
      });
      fetchPackages();
    } else {
      notifications.show({
        title: "Error",
        message: result.message,
        color: "red",
      });
      setLoading(false);
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Stack gap="xs">
          <Title order={2}>Package Management</Title>
          <Text c="dimmed">Manage subscription packages and plans</Text>
        </Stack>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          Create Package
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Display Order</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Price (Monthly)</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Featured</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {packages.length > 0 ? (
              packages.map((pkg) => (
                <Table.Tr key={pkg.id}>
                  <Table.Td>{pkg.display_order}</Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <IconPackage size={20} color="gray" />
                      <Text fw={500}>{pkg.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="blue">{pkg.plan_type}</Badge>
                  </Table.Td>
                  <Table.Td>₱{Number(pkg.price_monthly).toFixed(2)}</Table.Td>
                  <Table.Td>
                    {pkg.is_active ? (
                      <Badge color="green" variant="dot">Active</Badge>
                    ) : (
                      <Badge color="gray" variant="dot">Inactive</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {pkg.is_featured && <IconCheck size={18} color="green" />}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Edit">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEdit(pkg)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(pkg.id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7} align="center">
                  <Text c="dimmed" py="xl">No packages found</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal 
        opened={modalOpened} 
        onClose={closeModal} 
        title={editingId ? "Edit Package" : "Create Package"}
        size="lg"
      >
        <Stack gap="md">
            <Grid>
                <Grid.Col span={6}>
                    <TextInput
                        label="Package Name"
                        placeholder="e.g. Basic Plan"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput
                        label="Plan Type (Unique ID)"
                        placeholder="e.g. BASIC"
                        value={formData.plan_type}
                        onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                        required
                    />
                </Grid.Col>
            </Grid>

            <Textarea
                label="Description"
                placeholder="Brief description of the package"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <TextInput
                label="Intended For"
                placeholder="e.g. For personal use"
                value={formData.intended_for}
                onChange={(e) => setFormData({ ...formData, intended_for: e.target.value })}
            />

            <Grid>
                <Grid.Col span={4}>
                    <NumberInput
                        label="Monthly Price"
                        prefix="₱"
                        value={formData.price_monthly}
                        onChange={(val) => setFormData({ ...formData, price_monthly: Number(val) })}
                        min={0}
                        required
                    />
                </Grid.Col>
                <Grid.Col span={4}>
                    <NumberInput
                        label="Quarterly Price"
                        prefix="₱"
                        value={formData.price_quarterly || ""}
                        onChange={(val) => setFormData({ ...formData, price_quarterly: typeof val === 'number' ? val : null })}
                        min={0}
                    />
                </Grid.Col>
                <Grid.Col span={4}>
                    <NumberInput
                        label="Yearly Price"
                        prefix="₱"
                        value={formData.price_yearly || ""}
                        onChange={(val) => setFormData({ ...formData, price_yearly: typeof val === 'number' ? val : null })}
                        min={0}
                    />
                </Grid.Col>
            </Grid>

            <TagsInput
                label="Features"
                placeholder="Press Enter to add feature"
                value={formData.features}
                onChange={(val) => setFormData({ ...formData, features: val })}
            />
            
            <TagsInput
                label="Not Included"
                placeholder="Press Enter to add item"
                value={formData.not_included}
                onChange={(val) => setFormData({ ...formData, not_included: val })}
            />

            <Grid>
                <Grid.Col span={6}>
                    <NumberInput
                        label="Max Scanned Pages"
                        value={formData.max_scanned_pages || ""}
                        onChange={(val) => setFormData({ ...formData, max_scanned_pages: typeof val === 'number' ? val : null })}
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <NumberInput
                        label="Retention Days"
                        value={formData.retention_days || ""}
                        onChange={(val) => setFormData({ ...formData, retention_days: typeof val === 'number' ? val : null })}
                    />
                </Grid.Col>
            </Grid>

            <Grid>
                 <Grid.Col span={6}>
                    <NumberInput
                        label="Digital Storage (MB)"
                        value={formData.digital_storage_mb || ""}
                        onChange={(val) => setFormData({ ...formData, digital_storage_mb: typeof val === 'number' ? val : null })}
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <NumberInput
                        label="Max Team Members"
                        value={formData.max_team_members || ""}
                        onChange={(val) => setFormData({ ...formData, max_team_members: typeof val === 'number' ? val : null })}
                    />
                </Grid.Col>
            </Grid>

             <Grid>
                 <Grid.Col span={6}>
                    <NumberInput
                        label="Cashback %"
                         value={formData.cashback_percentage}
                        onChange={(val) => setFormData({ ...formData, cashback_percentage: Number(val) })}
                        min={0}
                        max={100}
                    />
                </Grid.Col>
                 <Grid.Col span={6}>
                    <NumberInput
                        label="Display Order"
                        value={formData.display_order}
                        onChange={(val) => setFormData({ ...formData, display_order: Number(val) })}
                    />
                </Grid.Col>
            </Grid>

            <Group>
                <Switch
                    label="Active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.currentTarget.checked })}
                />
                <Switch
                    label="Featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.currentTarget.checked })}
                />
            </Group>

          <Button fullWidth onClick={handleSubmit} loading={submitting}>
            {editingId ? "Update Package" : "Create Package"}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}

