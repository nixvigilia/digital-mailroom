"use client";

import {
  Title,
  Text,
  Stack,
  Paper,
  TextInput,
  Button,
  Avatar,
  Group,
  Switch,
  Divider,
  Select,
} from "@mantine/core";
import {
  IconUser,
  IconBell,
  IconLock,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import {useState} from "react";
import {notifications} from "@mantine/notifications";

export function SettingsPageClient() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    notifications.show({
      title: "Success",
      message: "Settings saved successfully",
      color: "green",
    });
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "800px"}}>
      <Title order={2}>Settings</Title>

      <Paper withBorder p="xl" radius="md">
        <Stack gap="lg">
          <Group>
            <IconUser size={24} />
            <Title order={4}>Profile Information</Title>
          </Group>
          <Divider />

          <Group align="flex-start">
            <Avatar size="xl" radius="xl" color="blue">
              U
            </Avatar>
            <Stack gap="xs" style={{flex: 1}}>
              <Button variant="light" size="xs" w="fit-content">
                Change Avatar
              </Button>
              <Text size="xs" c="dimmed">
                Recommended size: 256x256px. Max file size: 2MB.
              </Text>
            </Stack>
          </Group>

          <Stack gap="md">
            <Group grow>
              <TextInput label="First Name" placeholder="John" />
              <TextInput label="Last Name" placeholder="Doe" />
            </Group>
            <TextInput
              label="Email"
              placeholder="john.doe@example.com"
              disabled
              description="Contact support to change email"
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper withBorder p="xl" radius="md">
        <Stack gap="lg">
          <Group>
            <IconBell size={24} />
            <Title order={4}>Notifications</Title>
          </Group>
          <Divider />

          <Stack gap="md">
            <Switch label="Email notifications for new mail" defaultChecked />
            <Switch label="Email notifications for referrals" defaultChecked />
            <Switch label="Marketing emails" />
          </Stack>
        </Stack>
      </Paper>

      <Paper withBorder p="xl" radius="md">
        <Stack gap="lg">
          <Group>
            <IconLock size={24} />
            <Title order={4}>Security</Title>
          </Group>
          <Divider />

          <Button variant="light" color="red" w="fit-content">
            Change Password
          </Button>
        </Stack>
      </Paper>

      <Group justify="flex-end">
        <Button
          size="md"
          leftSection={<IconDeviceFloppy size={20} />}
          loading={loading}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Group>
    </Stack>
  );
}
