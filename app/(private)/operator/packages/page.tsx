"use client";

import {useState, useEffect} from "react";
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
  Select,
  ActionIcon,
  Tooltip,
  Modal,
  Textarea,
  NumberInput,
  Switch,
  MultiSelect,
  Alert,
  Divider,
} from "@mantine/core";
import {
  IconPackage,
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";
import {
  createPackage,
  updatePackage,
  deletePackage,
  getPackages,
  type PackageFormData,
} from "@/app/actions/packages";

interface Package {
  id: string;
  name: string;
  planType: string;
  description?: string | null;
  priceMonthly: number;
  priceQuarterly?: number | null;
  priceYearly?: number | null;
  features: string[];
  maxMailItems?: number | null;
  maxTeamMembers?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    planType: "",
    description: "",
    priceMonthly: 0,
    priceQuarterly: undefined,
    priceYearly: undefined,
    features: [],
    maxMailItems: undefined,
    maxTeamMembers: undefined,
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
  });
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await getPackages();
      setPackages(data as Package[]);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load packages.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    if (statusFilter !== "all" && pkg.isActive !== (statusFilter === "active"))
      return false;
    if (
      searchQuery &&
      !pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !pkg.planType.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setFormData({
      name: "",
      planType: "",
      description: "",
      priceMonthly: 0,
      priceQuarterly: undefined,
      priceYearly: undefined,
      features: [],
      maxMailItems: undefined,
      maxTeamMembers: undefined,
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
    });
    setFeatureInput("");
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      planType: pkg.planType,
      description: pkg.description || "",
      priceMonthly: pkg.priceMonthly,
      priceQuarterly: pkg.priceQuarterly || undefined,
      priceYearly: pkg.priceYearly || undefined,
      features: pkg.features,
      maxMailItems: pkg.maxMailItems || undefined,
      maxTeamMembers: pkg.maxTeamMembers || undefined,
      isActive: pkg.isActive,
      isFeatured: pkg.isFeatured,
      displayOrder: pkg.displayOrder,
    });
    setFeatureInput("");
    setModalOpen(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.planType || !formData.priceMonthly) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill in all required fields.",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (editingPackage) {
        result = await updatePackage(editingPackage.id, formData);
      } else {
        result = await createPackage(formData);
      }

      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        setModalOpen(false);
        setEditingPackage(null);
        await loadPackages();
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
        message: "An unexpected error occurred.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (pkg: Package) => {
    setPackageToDelete(pkg);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;

    setSubmitting(true);
    try {
      const result = await deletePackage(packageToDelete.id);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        setDeleteConfirmOpen(false);
        setPackageToDelete(null);
        await loadPackages();
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
        message: "An unexpected error occurred.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group gap="md" align="center" justify="space-between">
          <Group gap="md" align="center">
            <IconPackage size={32} color="var(--mantine-color-blue-6)" />
            <Title
              order={1}
              fw={800}
              style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
            >
              Packages & Pricing
            </Title>
          </Group>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={handleOpenCreate}
          >
            Create Package
          </Button>
        </Group>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Manage subscription packages and pricing plans
        </Text>
      </Stack>

      {/* Filters */}
      <Paper withBorder p="md" radius="md">
        <Group gap="md" wrap="wrap">
          <TextInput
            placeholder="Search packages..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{flex: 1, minWidth: 200}}
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "all")}
            data={[
              {value: "all", label: "All Status"},
              {value: "active", label: "Active"},
              {value: "inactive", label: "Inactive"},
            ]}
            style={{minWidth: 140}}
          />
        </Group>
      </Paper>

      {/* Packages Table */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconPackage size={24} />
              <Title order={2} size="h3">
                Packages ({filteredPackages.length})
              </Title>
            </Group>
          </Group>
          {loading ? (
            <Text c="dimmed" ta="center" py="xl">
              Loading packages...
            </Text>
          ) : filteredPackages.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No packages found. Create your first package to get started.
            </Text>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Plan Type</Table.Th>
                  <Table.Th>Monthly Price</Table.Th>
                  <Table.Th>Features</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredPackages.map((pkg) => (
                  <Table.Tr key={pkg.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={500} size="sm">
                          {pkg.name}
                        </Text>
                        {pkg.isFeatured && (
                          <Badge size="xs" color="yellow" variant="light">
                            Featured
                          </Badge>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {pkg.planType}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{formatPrice(pkg.priceMonthly)}</Text>
                      {pkg.priceYearly && (
                        <Text size="xs" c="dimmed">
                          {formatPrice(pkg.priceYearly)}/year
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {pkg.features.length} feature
                        {pkg.features.length !== 1 ? "s" : ""}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={pkg.isActive ? "green" : "gray"}
                        variant="light"
                        leftSection={
                          pkg.isActive ? (
                            <IconCheck size={12} />
                          ) : (
                            <IconX size={12} />
                          )
                        }
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Edit Package">
                          <ActionIcon
                            variant="light"
                            onClick={() => handleOpenEdit(pkg)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete Package">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleDeleteClick(pkg)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPackage(null);
        }}
        title={editingPackage ? "Edit Package" : "Create Package"}
        size="xl"
      >
        <Stack gap="md">
          <TextInput
            label="Package Name"
            placeholder="e.g., Starter Plan"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />

          <TextInput
            label="Plan Type"
            placeholder="e.g., BASIC, PREMIUM, CUSTOM_PLAN"
            required
            value={formData.planType}
            onChange={(e) =>
              setFormData({...formData, planType: e.target.value})
            }
            description="Enter any plan type name (will be converted to uppercase)"
          />

          <Textarea
            label="Description"
            placeholder="Package description..."
            value={formData.description}
            onChange={(e) =>
              setFormData({...formData, description: e.target.value})
            }
            rows={3}
          />

          <Group grow>
            <NumberInput
              label="Monthly Price"
              placeholder="0.00"
              required
              min={0}
              step={0.01}
              decimalScale={2}
              prefix="$"
              value={formData.priceMonthly}
              onChange={(value) =>
                setFormData({...formData, priceMonthly: Number(value) || 0})
              }
            />
            <NumberInput
              label="Quarterly Price (Optional)"
              placeholder="0.00"
              min={0}
              step={0.01}
              decimalScale={2}
              prefix="$"
              value={formData.priceQuarterly}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  priceQuarterly: Number(value) || undefined,
                })
              }
            />
            <NumberInput
              label="Yearly Price (Optional)"
              placeholder="0.00"
              min={0}
              step={0.01}
              decimalScale={2}
              prefix="$"
              value={formData.priceYearly}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  priceYearly: Number(value) || undefined,
                })
              }
            />
          </Group>

          <Group grow>
            <NumberInput
              label="Max Mail Items (Optional)"
              placeholder="Unlimited"
              min={0}
              value={formData.maxMailItems}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  maxMailItems: Number(value) || undefined,
                })
              }
            />
            <NumberInput
              label="Max Team Members (Optional)"
              placeholder="Unlimited"
              min={0}
              value={formData.maxTeamMembers}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  maxTeamMembers: Number(value) || undefined,
                })
              }
            />
          </Group>

          <Divider label="Features" labelPosition="center" />

          <Stack gap="xs">
            <Group gap="xs">
              <TextInput
                placeholder="Add a feature..."
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                style={{flex: 1}}
              />
              <Button onClick={handleAddFeature}>Add</Button>
            </Group>
            {formData.features.length > 0 && (
              <Stack gap="xs">
                {formData.features.map((feature, index) => (
                  <Group key={index} justify="space-between">
                    <Text size="sm">{feature}</Text>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            )}
          </Stack>

          <Group grow>
            <NumberInput
              label="Display Order"
              placeholder="0"
              min={0}
              value={formData.displayOrder}
              onChange={(value) =>
                setFormData({...formData, displayOrder: Number(value) || 0})
              }
            />
          </Group>

          <Group>
            <Switch
              label="Active"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({...formData, isActive: e.currentTarget.checked})
              }
            />
            <Switch
              label="Featured"
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData({...formData, isFeatured: e.currentTarget.checked})
              }
            />
          </Group>

          <Divider />

          <Group justify="flex-end" gap="md">
            <Button
              variant="subtle"
              onClick={() => {
                setModalOpen(false);
                setEditingPackage(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editingPackage ? "Update Package" : "Create Package"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setPackageToDelete(null);
        }}
        title="Delete Package"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            Are you sure you want to delete "{packageToDelete?.name}"? This
            action cannot be undone. Packages with active subscriptions cannot
            be deleted.
          </Alert>
          <Group justify="flex-end" gap="md">
            <Button
              variant="subtle"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setPackageToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              loading={submitting}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
