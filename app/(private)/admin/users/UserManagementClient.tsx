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
  Select,
  ActionIcon,
  Tooltip,
  Modal,
  LoadingOverlay,
  Pagination,
  CopyButton,
} from "@mantine/core";
import {
  IconSearch,
  IconUserPlus,
  IconTrash,
  IconShield,
  IconRefresh,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import {useState} from "react";
import {useDisclosure, useDebouncedValue} from "@mantine/hooks";
import {notifications} from "@mantine/notifications";
import useSWR from "swr";
import {
  getUsers,
  createOperatorUser,
  deleteUser,
  UserData,
} from "@/app/actions/admin-users";

export default function UserManagementClient() {
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<string>("100");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const limit = parseInt(itemsPerPage);
  const offset = (activePage - 1) * limit;

  // Fetcher function for SWR
  const fetcher = async ([key, role, term, pageLimit, pageOffset]: [
    string,
    string,
    string,
    number,
    number
  ]) => {
    const roleParam = role === "all" ? undefined : (role as any);
    const result = await getUsers(roleParam, term, pageLimit, pageOffset);
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch users");
    }
    return result;
  };

  const {data, error, isLoading, mutate} = useSWR(
    ["users", roleFilter, debouncedSearch, limit, offset],
    fetcher,
    {
      keepPreviousData: true,
      onError: (err: Error) => {
        notifications.show({
          title: "Error",
          message: err.message,
          color: "red",
        });
      },
    }
  );

  const users = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Create Modal State
  const [createOpened, {open: openCreate, close: closeCreate}] =
    useDisclosure(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const generatePassword = () => {
    const length = 16;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  };

  const handleOpenCreate = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: generatePassword(),
    });
    openCreate();
  };

  const handleCreateOperator = async () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      notifications.show({
        title: "Error",
        message: "All fields are required",
        color: "red",
      });
      return;
    }

    setCreateLoading(true);
    const result = await createOperatorUser(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    );

    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Operator created successfully",
        color: "green",
      });
      closeCreate();
      setFormData({firstName: "", lastName: "", email: "", password: ""});
      mutate();
    } else {
      notifications.show({
        title: "Error",
        message: result.message,
        color: "red",
      });
    }
    setCreateLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    const result = await deleteUser(id);
    if (result.success) {
      notifications.show({
        title: "Success",
        message: "User deleted successfully",
        color: "green",
      });
      mutate();
    } else {
      notifications.show({
        title: "Error",
        message: result.message,
        color: "red",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "OPERATOR":
        return "orange";
      case "SYSTEM_ADMIN":
        return "red";
      case "BUSINESS_ADMIN":
        return "indigo";
      default:
        return "blue";
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Stack gap="xs">
          <Title order={2}>User Management</Title>
          <Text c="dimmed">Manage operators and administrators</Text>
        </Stack>
        <Button
          leftSection={<IconUserPlus size={16} />}
          onClick={handleOpenCreate}
        >
          Create Operator
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Group>
          <TextInput
            placeholder="Search by email..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActivePage(1);
            }}
            style={{flex: 1}}
          />
          <Select
            placeholder="Filter by role"
            value={roleFilter}
            onChange={(v) => {
              setRoleFilter(v || "all");
              setActivePage(1);
            }}
            data={[
              {value: "all", label: "All"},
              {value: "SYSTEM_ADMIN", label: "System Admin"},
              {value: "OPERATOR", label: "Operator"},
            ]}
          />
          <Select
            value={itemsPerPage}
            onChange={(value) => {
              setItemsPerPage(value || "100");
              setActivePage(1);
            }}
            data={["20", "50", "100", "200"]}
            w={100}
            allowDeselect={false}
          />
        </Group>
      </Paper>

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{radius: "sm", blur: 2}}
        />
        <Stack gap="lg">
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.length > 0 ? (
                users.map((user: UserData) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>
                            {user.firstName} {user.lastName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {user.email}
                          </Text>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={getRoleBadgeColor(user.role)}
                        variant="light"
                      >
                        {user.role}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconShield size={14} />
                        <Text size="sm">{user.userType}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {user.role !== "SYSTEM_ADMIN" && (
                          <Tooltip label="Delete User">
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => handleDelete(user.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={5} align="center">
                    <Text c="dimmed" py="xl">
                      No users found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          <Group justify="center">
            <Pagination
              total={totalPages}
              value={activePage}
              onChange={setActivePage}
            />
          </Group>
        </Stack>
      </Paper>

      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title="Create Operator Account"
      >
        <Stack gap="md">
          <TextInput
            label="First Name"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({...formData, firstName: e.target.value})
            }
            required
          />
          <TextInput
            label="Last Name"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({...formData, lastName: e.target.value})
            }
            required
          />
          <TextInput
            label="Email"
            placeholder="operator@example.com"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <TextInput
            label="Password"
            placeholder="Secure password"
            value={formData.password}
            readOnly
            rightSectionWidth={80}
            rightSection={
              <Group gap={5} mr={5}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() =>
                    setFormData({...formData, password: generatePassword()})
                  }
                  title="Regenerate"
                >
                  <IconRefresh size={16} />
                </ActionIcon>
                <CopyButton value={formData.password}>
                  {({copied, copy}) => (
                    <ActionIcon
                      variant="subtle"
                      color={copied ? "teal" : "gray"}
                      onClick={copy}
                      title="Copy"
                    >
                      {copied ? (
                        <IconCheck size={16} />
                      ) : (
                        <IconCopy size={16} />
                      )}
                    </ActionIcon>
                  )}
                </CopyButton>
              </Group>
            }
            required
          />
          <Button
            fullWidth
            onClick={handleCreateOperator}
            loading={createLoading}
          >
            Create Operator
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
