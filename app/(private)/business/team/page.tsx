"use client";

import {useState} from "react";
import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  Table,
  Badge,
  Modal,
  TextInput,
  Select,
  ActionIcon,
  Tooltip,
  Alert,
  Card,
  SimpleGrid,
  Textarea,
  Switch,
  Divider,
  Menu,
  Avatar,
  Box,
} from "@mantine/core";
import {
  IconUsers,
  IconPlus,
  IconMail,
  IconTrash,
  IconEdit,
  IconUserCheck,
  IconUserX,
  IconDots,
  IconShield,
  IconBuilding,
  IconSearch,
  IconFilter,
  IconRefresh,
} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";

// Mock team members - will be replaced with backend
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  department: string;
  status: "active" | "pending" | "inactive";
  invitedAt: Date;
  lastActive?: Date;
  avatar?: string;
  mailItemsCount?: number;
  permissions?: {
    canViewAllMail: boolean;
    canManageTeam: boolean;
    canManageBilling: boolean;
  };
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "admin",
    department: "Finance",
    status: "active",
    invitedAt: new Date("2024-01-15"),
    lastActive: new Date("2025-01-15"),
    mailItemsCount: 45,
    permissions: {
      canViewAllMail: true,
      canManageTeam: true,
      canManageBilling: true,
    },
  },
  {
    id: "2",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "member",
    department: "Legal",
    status: "active",
    invitedAt: new Date("2024-02-01"),
    lastActive: new Date("2025-01-14"),
    mailItemsCount: 23,
    permissions: {
      canViewAllMail: false,
      canManageTeam: false,
      canManageBilling: false,
    },
  },
  {
    id: "3",
    name: "Sarah Lee",
    email: "sarah.lee@company.com",
    role: "member",
    department: "Operations",
    status: "pending",
    invitedAt: new Date("2025-01-10"),
    mailItemsCount: 0,
    permissions: {
      canViewAllMail: false,
      canManageTeam: false,
      canManageBilling: false,
    },
  },
  {
    id: "4",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "member",
    department: "Human Resources",
    status: "active",
    invitedAt: new Date("2024-03-15"),
    lastActive: new Date("2025-01-13"),
    mailItemsCount: 12,
    permissions: {
      canViewAllMail: false,
      canManageTeam: false,
      canManageBilling: false,
    },
  },
];

const departments = [
  "Finance",
  "Human Resources",
  "Legal",
  "Operations",
  "General",
];

const roles = [
  {
    value: "admin",
    label: "Business Admin",
    description: "Full access to manage team and settings",
  },
  {
    value: "member",
    label: "Team Member",
    description: "Access to assigned mail and departments",
  },
];

// Mock current user - will be replaced with actual auth
const currentUserRole = "admin"; // or "member"

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string | null>("member");
  const [inviteDepartment, setInviteDepartment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const isAdmin = currentUserRole === "admin";

  const handleInvite = () => {
    if (!inviteEmail || !inviteRole || !inviteDepartment) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill in all fields",
        color: "red",
      });
      return;
    }

    // TODO: Implement actual invite API call
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole as "admin" | "member",
      department: inviteDepartment,
      status: "pending",
      invitedAt: new Date(),
      mailItemsCount: 0,
      permissions: {
        canViewAllMail: inviteRole === "admin",
        canManageTeam: inviteRole === "admin",
        canManageBilling: inviteRole === "admin",
      },
    };

    setTeamMembers([...teamMembers, newMember]);
    setInviteModalOpen(false);
    setInviteEmail("");
    setInviteRole("member");
    setInviteDepartment(null);
    notifications.show({
      title: "Success",
      message: "Invitation sent successfully",
      color: "green",
    });
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedMember) return;
    // TODO: Implement actual update API call
    setTeamMembers(
      teamMembers.map((m) => (m.id === selectedMember.id ? selectedMember : m))
    );
    setEditModalOpen(false);
    setSelectedMember(null);
    notifications.show({
      title: "Success",
      message: "Team member updated",
      color: "green",
    });
  };

  const handleRemove = (id: string) => {
    // TODO: Implement actual remove API call
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
    notifications.show({
      title: "Success",
      message: "Team member removed",
      color: "green",
    });
  };

  const handleResendInvite = (email: string) => {
    // TODO: Implement actual resend invite API call
    notifications.show({
      title: "Success",
      message: "Invitation resent",
      color: "green",
    });
  };

  const handleRoleChange = (memberId: string, newRole: "admin" | "member") => {
    // TODO: Implement actual role change API call
    setTeamMembers(
      teamMembers.map((m) =>
        m.id === memberId
          ? {
              ...m,
              role: newRole,
              permissions: {
                canViewAllMail: newRole === "admin",
                canManageTeam: newRole === "admin",
                canManageBilling: newRole === "admin",
              },
            }
          : m
      )
    );
    notifications.show({
      title: "Success",
      message: "Role updated successfully",
      color: "green",
    });
  };

  const statusColors: Record<string, string> = {
    active: "green",
    pending: "yellow",
    inactive: "gray",
  };

  // Filter team members
  const filteredMembers = teamMembers.filter((member) => {
    if (statusFilter !== "all" && member.status !== statusFilter) return false;
    if (
      departmentFilter !== "all" &&
      member.department.toLowerCase() !== departmentFilter.toLowerCase()
    )
      return false;
    if (
      searchQuery &&
      !member.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !member.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  // Statistics
  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter((m) => m.status === "active").length,
    pending: teamMembers.filter((m) => m.status === "pending").length,
    admins: teamMembers.filter((m) => m.role === "admin").length,
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={4}>
            <Group gap="md" align="center">
              <IconUsers size={32} color="var(--mantine-color-blue-6)" />
              <Title
                order={1}
                fw={800}
                style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
              >
                Team Management
              </Title>
            </Group>
            <Text c="dimmed" size="lg" visibleFrom="sm">
              {isAdmin
                ? "Manage your team members and their access"
                : "View your team members"}
            </Text>
            <Text c="dimmed" size="sm" hiddenFrom="sm">
              {isAdmin
                ? "Manage your team members and their access"
                : "View your team members"}
            </Text>
          </Stack>
          {isAdmin && (
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setInviteModalOpen(true)}
            >
              Invite Team Member
            </Button>
          )}
        </Group>
      </Stack>

      {/* Statistics Cards */}
      <SimpleGrid cols={{base: 2, sm: 4}} spacing="md">
        <Card withBorder p="md" radius="md">
          <Stack gap={4}>
            <Text size="sm" c="dimmed" fw={500}>
              Total Members
            </Text>
            <Text size="xl" fw={700}>
              {stats.total}
            </Text>
          </Stack>
        </Card>
        <Card withBorder p="md" radius="md">
          <Stack gap={4}>
            <Text size="sm" c="dimmed" fw={500}>
              Active
            </Text>
            <Text size="xl" fw={700} c="green">
              {stats.active}
            </Text>
          </Stack>
        </Card>
        <Card withBorder p="md" radius="md">
          <Stack gap={4}>
            <Text size="sm" c="dimmed" fw={500}>
              Pending
            </Text>
            <Text size="xl" fw={700} c="yellow">
              {stats.pending}
            </Text>
          </Stack>
        </Card>
        <Card withBorder p="md" radius="md">
          <Stack gap={4}>
            <Text size="sm" c="dimmed" fw={500}>
              Admins
            </Text>
            <Text size="xl" fw={700} c="blue">
              {stats.admins}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      {isAdmin && (
        <Paper withBorder p="md" radius="md">
          <Group gap="md" wrap="wrap">
            <TextInput
              placeholder="Search by name or email..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{flex: 1, minWidth: 200}}
            />
            <Select
              placeholder="Filter by status"
              leftSection={<IconFilter size={16} />}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || "all")}
              data={[
                {value: "all", label: "All Status"},
                {value: "active", label: "Active"},
                {value: "pending", label: "Pending"},
                {value: "inactive", label: "Inactive"},
              ]}
              style={{minWidth: 150}}
            />
            <Select
              placeholder="Filter by department"
              leftSection={<IconBuilding size={16} />}
              value={departmentFilter}
              onChange={(value) => setDepartmentFilter(value || "all")}
              data={[
                {value: "all", label: "All Departments"},
                ...departments.map((dept) => ({
                  value: dept.toLowerCase(),
                  label: dept,
                })),
              ]}
              style={{minWidth: 180}}
            />
          </Group>
        </Paper>
      )}

      {/* Team Members Table */}
      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconUsers size={24} />
              <Title order={2} size="h3">
                Team Members ({filteredMembers.length})
              </Title>
            </Group>
          </Group>
          {filteredMembers.length === 0 ? (
            <Alert color="blue">
              {searchQuery ||
              statusFilter !== "all" ||
              departmentFilter !== "all"
                ? "No team members match your filters."
                : "No team members yet. Invite your first team member to get started."}
            </Alert>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Member</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Department</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Activity</Table.Th>
                  {isAdmin && <Table.Th>Actions</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredMembers.map((member) => (
                  <Table.Tr key={member.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar size="sm" radius="xl">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </Avatar>
                        <Stack gap={2}>
                          <Text fw={500}>{member.name}</Text>
                          <Text size="xs" c="dimmed">
                            {member.email}
                          </Text>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={member.role === "admin" ? "blue" : "gray"}
                        variant="light"
                        leftSection={
                          member.role === "admin" ? (
                            <IconShield size={12} />
                          ) : undefined
                        }
                      >
                        {member.role === "admin" ? "Admin" : "Member"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{member.department}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={statusColors[member.status]}
                        variant="light"
                      >
                        {member.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        {member.lastActive ? (
                          <Text size="xs" c="dimmed">
                            {member.lastActive.toLocaleDateString()}
                          </Text>
                        ) : (
                          <Text size="xs" c="dimmed">
                            Never
                          </Text>
                        )}
                        {member.mailItemsCount !== undefined && (
                          <Text size="xs" c="dimmed">
                            {member.mailItemsCount} mail items
                          </Text>
                        )}
                      </Stack>
                    </Table.Td>
                    {isAdmin && (
                      <Table.Td>
                        <Group gap="xs">
                          {member.status === "pending" && (
                            <Tooltip label="Resend Invitation">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => handleResendInvite(member.email)}
                              >
                                <IconMail size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="light">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEdit size={16} />}
                                onClick={() => handleEdit(member)}
                              >
                                Edit Member
                              </Menu.Item>
                              {member.role === "admin" ? (
                                <Menu.Item
                                  leftSection={<IconUserX size={16} />}
                                  onClick={() =>
                                    handleRoleChange(member.id, "member")
                                  }
                                >
                                  Change to Member
                                </Menu.Item>
                              ) : (
                                <Menu.Item
                                  leftSection={<IconShield size={16} />}
                                  onClick={() =>
                                    handleRoleChange(member.id, "admin")
                                  }
                                >
                                  Promote to Admin
                                </Menu.Item>
                              )}
                              <Menu.Divider />
                              <Menu.Item
                                leftSection={<IconTrash size={16} />}
                                color="red"
                                onClick={() => handleRemove(member.id)}
                              >
                                Remove Member
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {/* Invite Modal */}
      <Modal
        opened={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Email Address"
            placeholder="colleague@company.com"
            required
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select
            label="Role"
            placeholder="Select role"
            required
            data={roles}
            value={inviteRole}
            onChange={setInviteRole}
            description={
              inviteRole
                ? roles.find((r) => r.value === inviteRole)?.description
                : undefined
            }
          />
          <Select
            label="Department"
            placeholder="Select department"
            required
            data={departments}
            value={inviteDepartment}
            onChange={setInviteDepartment}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>Send Invitation</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMember(null);
        }}
        title="Edit Team Member"
        size="md"
      >
        {selectedMember && (
          <Stack gap="md">
            <TextInput
              label="Name"
              value={selectedMember.name}
              onChange={(e) =>
                setSelectedMember({...selectedMember, name: e.target.value})
              }
            />
            <TextInput
              label="Email"
              value={selectedMember.email}
              disabled
              description="Email cannot be changed"
            />
            <Select
              label="Department"
              data={departments}
              value={selectedMember.department}
              onChange={(value) =>
                setSelectedMember({...selectedMember, department: value || ""})
              }
            />
            <Select
              label="Status"
              data={[
                {value: "active", label: "Active"},
                {value: "pending", label: "Pending"},
                {value: "inactive", label: "Inactive"},
              ]}
              value={selectedMember.status}
              onChange={(value) =>
                setSelectedMember({
                  ...selectedMember,
                  status:
                    (value as "active" | "pending" | "inactive") || "active",
                })
              }
            />
            <Divider />
            <Text size="sm" fw={600}>
              Permissions
            </Text>
            <Switch
              label="Can view all mail"
              description="Access to all mail items across departments"
              checked={selectedMember.permissions?.canViewAllMail || false}
              onChange={(e) =>
                setSelectedMember({
                  ...selectedMember,
                  permissions: {
                    ...selectedMember.permissions!,
                    canViewAllMail: e.currentTarget.checked,
                  },
                })
              }
              disabled={selectedMember.role === "admin"}
            />
            <Switch
              label="Can manage team"
              description="Add, remove, and edit team members"
              checked={selectedMember.permissions?.canManageTeam || false}
              onChange={(e) =>
                setSelectedMember({
                  ...selectedMember,
                  permissions: {
                    ...selectedMember.permissions!,
                    canManageTeam: e.currentTarget.checked,
                  },
                })
              }
              disabled={selectedMember.role === "admin"}
            />
            <Switch
              label="Can manage billing"
              description="Access to billing and subscription settings"
              checked={selectedMember.permissions?.canManageBilling || false}
              onChange={(e) =>
                setSelectedMember({
                  ...selectedMember,
                  permissions: {
                    ...selectedMember.permissions!,
                    canManageBilling: e.currentTarget.checked,
                  },
                })
              }
              disabled={selectedMember.role === "admin"}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedMember(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
