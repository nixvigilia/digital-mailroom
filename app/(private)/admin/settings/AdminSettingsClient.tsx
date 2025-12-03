"use client";

import {Stack, Title, TextInput, Button, Paper, Group} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {useState, useEffect} from "react";
import {
  updateAdminProfile,
  getAdminProfile,
} from "@/app/actions/admin-settings";
import {IconCheck, IconAlertCircle} from "@tabler/icons-react";

export default function AdminSettingsClient() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    passwordHint: "",
    integrationEmail: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const result = await getAdminProfile();
      if (result.success && result.data) {
        setFormData({
          passwordHint: result.data.passwordHint || "",
          integrationEmail: result.data.integrationEmail || "",
        });
      }
      setFetching(false);
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateAdminProfile(
      formData.passwordHint,
      formData.integrationEmail
    );

    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Settings updated successfully",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } else {
      notifications.show({
        title: "Error",
        message: result.message || "Failed to update settings",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    }
    setLoading(false);
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Admin Settings</Title>

      <Paper withBorder p="xl" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md" maw={500}>
            <TextInput
              label="Integration Email"
              description="Email address used for system integrations or notifications"
              placeholder="integration@example.com"
              value={formData.integrationEmail}
              onChange={(e) =>
                setFormData({...formData, integrationEmail: e.target.value})
              }
            />

            <TextInput
              label="Password Hint"
              description="A hint to help you remember your password (visible publicly via email lookup)"
              placeholder="My first pet's name"
              value={formData.passwordHint}
              onChange={(e) =>
                setFormData({...formData, passwordHint: e.target.value})
              }
            />

            <Group justify="flex-end" mt="md">
              <Button type="submit" loading={loading} disabled={fetching}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
