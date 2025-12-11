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
  PasswordInput,
} from "@mantine/core";
import {
  IconUser,
  IconBell,
  IconLock,
  IconMail,
  IconShieldLock,
} from "@tabler/icons-react";
import {useState} from "react";
import {notifications} from "@mantine/notifications";
import {
  updateNotificationSettings,
  updateMailSettings,
  setShreddingPin,
} from "@/app/actions/settings";
import Link from "next/link";

interface SettingsPageClientProps {
  initialSettings: {
    email: string;
    firstName: string;
    lastName: string;
    defaultForwardAddress: string;
    hasShreddingPin: boolean;
    notifications: {
      newMail: boolean;
      referrals: boolean;
      marketing: boolean;
    };
  };
}

export function SettingsPageClient({initialSettings}: SettingsPageClientProps) {
  const [loading, setLoading] = useState(false);
  const [notifSettings, setNotifSettings] = useState(
    initialSettings?.notifications || {
      newMail: true,
      referrals: true,
      marketing: false,
    }
  );
  const [defaultForwardAddress, setDefaultForwardAddress] = useState(
    initialSettings?.defaultForwardAddress || ""
  );
  const [savingAddress, setSavingAddress] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleNotificationToggle = async (
    setting: "newMail" | "referrals" | "marketing",
    value: boolean
  ) => {
    // Store previous state for potential revert
    const previousSettings = {...notifSettings};

    // Optimistically update UI
    const updatedSettings = {
      ...notifSettings,
      [setting]: value,
    };
    setNotifSettings(updatedSettings);

    try {
      const result = await updateNotificationSettings(updatedSettings);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: "Notification settings updated",
          color: "green",
        });
      } else {
        // Revert on failure
        setNotifSettings(previousSettings);
        notifications.show({
          title: "Error",
          message: result.message || "Failed to update notification settings",
          color: "red",
        });
      }
    } catch (error) {
      // Revert on error
      setNotifSettings(previousSettings);
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred",
        color: "red",
      });
    }
  };

  const handleSaveForwardingAddress = async () => {
    setSavingAddress(true);
    try {
      const result = await updateMailSettings(defaultForwardAddress);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: "Default forwarding address saved",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Error",
          message: result.message || "Failed to save forwarding address",
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
      setSavingAddress(false);
    }
  };

  const handleSetPin = async () => {
    if (pin !== confirmPin) {
      notifications.show({
        title: "Error",
        message: "PINs do not match",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await setShreddingPin(pin);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: "Security PIN set successfully",
          color: "green",
        });
        setPin("");
        setConfirmPin("");
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
        message: "Failed to set PIN",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
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
              {(initialSettings?.firstName?.[0] || "") +
                (initialSettings?.lastName?.[0] || "") || "U"}
            </Avatar>
            {/* Avatar upload not implemented yet */}
            {/* <Stack gap="xs" style={{flex: 1}}>
              <Button variant="light" size="xs" w="fit-content">
                Change Avatar
              </Button>
              <Text size="xs" c="dimmed">
                Recommended size: 256x256px. Max file size: 2MB.
              </Text>
            </Stack> */}
          </Group>

          <Stack gap="md">
            <Group grow>
              <TextInput
                label="First Name"
                value={initialSettings?.firstName || ""}
                disabled
              />
              <TextInput
                label="Last Name"
                value={initialSettings?.lastName || ""}
                disabled
              />
            </Group>
            <TextInput
              label="Email"
              value={initialSettings?.email || ""}
              disabled
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
            <Switch
              label="Email notifications for new mail"
              checked={notifSettings.newMail}
              onChange={(event) =>
                handleNotificationToggle("newMail", event.currentTarget.checked)
              }
            />
            <Switch
              label="Email notifications for referrals"
              checked={notifSettings.referrals}
              onChange={(event) =>
                handleNotificationToggle(
                  "referrals",
                  event.currentTarget.checked
                )
              }
            />
            <Switch
              label="Marketing emails"
              checked={notifSettings.marketing}
              onChange={(event) =>
                handleNotificationToggle(
                  "marketing",
                  event.currentTarget.checked
                )
              }
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper withBorder p="xl" radius="md">
        <Stack gap="lg">
          <Group>
            <IconMail size={24} />
            <Title order={4}>Mail Preferences</Title>
          </Group>
          <Divider />

          <Stack gap="md">
            <TextInput
              label="Default Forwarding Address"
              placeholder="123 Main St, City, State ZIP"
              value={defaultForwardAddress}
              onChange={(e) => setDefaultForwardAddress(e.target.value)}
              description="This address will be pre-filled when you forward mail."
            />
            <Group justify="flex-end">
              <Button
                onClick={handleSaveForwardingAddress}
                loading={savingAddress}
                disabled={defaultForwardAddress === (initialSettings?.defaultForwardAddress || "")}
              >
                Save Address
              </Button>
            </Group>
          </Stack>
        </Stack>
      </Paper>

      <Paper withBorder p="xl" radius="md">
        <Stack gap="lg">
          <Group>
            <IconShieldLock size={24} />
            <Title order={4}>Security & Privacy</Title>
          </Group>
          <Divider />

          <Stack gap="md">
            <Text fw={500}>Shredding PIN</Text>
            <Text size="sm" c="dimmed">
              Set a 4-digit PIN to confirm shredding requests. This adds an
              extra layer of security to prevent accidental deletion.
            </Text>
            {initialSettings?.hasShreddingPin && (
              <Text size="sm" c="green">
                ✓ PIN is currently set
              </Text>
            )}
            <Group align="flex-end">
              <PasswordInput
                label="New PIN"
                placeholder="1234"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                w={120}
              />
              <PasswordInput
                label="Confirm PIN"
                placeholder="1234"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                w={120}
              />
              <Button
                variant="light"
                onClick={handleSetPin}
                disabled={!pin || pin.length !== 4 || pin !== confirmPin}
                loading={loading}
              >
                {initialSettings?.hasShreddingPin ? "Update PIN" : "Set PIN"}
              </Button>
            </Group>
          </Stack>

          <Divider />

          <Group>
            <IconLock size={24} />
            <Title order={4}>Account Security</Title>
          </Group>

          <Link href="/forgot-password">
            <Button variant="light" color="red" w="fit-content">
              Change Password
            </Button>
          </Link>
        </Stack>
      </Paper>
    </Stack>
  );
}
