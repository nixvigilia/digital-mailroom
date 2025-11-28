"use client";

import {useState, useEffect} from "react";
import {createClient} from "@/utils/supabase/client";
import {
  Title,
  Text,
  Stack,
  Paper,
  TextInput,
  Switch,
  Button,
  Divider,
  Group,
  Select,
  Textarea,
  Alert,
} from "@mantine/core";
import {
  IconBell,
  IconMail,
  IconMapPin,
  IconDeviceMobile,
  IconCheck,
  IconBuilding,
} from "@tabler/icons-react";

export default function BusinessSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notifyOnNewMail, setNotifyOnNewMail] = useState(true);
  const [notifyOnScanComplete, setNotifyOnScanComplete] = useState(true);
  const [notifyOnForward, setNotifyOnForward] = useState(false);
  const [notifyOnTeamActivity, setNotifyOnTeamActivity] = useState(true);

  // Forwarding preferences
  const [forwardingAddress, setForwardingAddress] = useState("");
  const [autoForward, setAutoForward] = useState(false);
  const [forwardingFrequency, setForwardingFrequency] = useState<string | null>("weekly");

  // Business account preferences
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      // TODO: Load from backend
      const {
        data: {user},
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
      }
    };
    loadSettings();
  }, [supabase]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    // TODO: Save to backend
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      <Stack gap="xs">
        <Group gap="md" align="center">
          <IconBuilding size={32} color="var(--mantine-color-blue-6)" />
          <Title order={1} fw={800} style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}>
            Business Settings
          </Title>
        </Group>
        <Text c="dimmed" size="lg" visibleFrom="sm">
          Manage your business preferences and account settings
        </Text>
        <Text c="dimmed" size="sm" hiddenFrom="sm">
          Manage your business preferences and account settings
        </Text>
      </Stack>

      {saved && (
        <Alert icon={<IconCheck size={16} />} color="green" title="Settings saved">
          Your preferences have been updated successfully.
        </Alert>
      )}

      {/* Business Information */}
      <Paper withBorder p="xl" radius="md" style={{padding: "clamp(1rem, 4vw, 1.5rem)"}}>
        <Stack gap="md">
          <Group gap="sm">
            <IconBuilding size={24} />
            <Title order={2} size="h3">
              Business Information
            </Title>
          </Group>
          <Divider />
          <Stack gap="md">
            <TextInput
              label="Business Name"
              placeholder="Your Company Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              leftSection={<IconBuilding size={18} />}
            />
            <TextInput
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftSection={<IconMail size={18} />}
              disabled
              description="Contact support to change your email address"
            />
            <TextInput
              label="Phone Number"
              placeholder="+63 (XXX) XXX-XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftSection={<IconDeviceMobile size={18} />}
            />
            <Textarea
              label="Business Mailing Address"
              placeholder="Your Digital Mailroom assigned address"
              value={mailingAddress}
              onChange={(e) => setMailingAddress(e.target.value)}
              rows={3}
              description="This is your assigned Digital Mailroom address where mail will be received"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Notification Preferences */}
      <Paper withBorder p="xl" radius="md" style={{padding: "clamp(1rem, 4vw, 1.5rem)"}}>
        <Stack gap="md">
          <Group gap="sm">
            <IconBell size={24} />
            <Title order={2} size="h3">
              Notification Preferences
            </Title>
          </Group>
          <Divider />
          <Stack gap="md">
            <Switch
              label="Email Notifications"
              description="Receive notifications via email"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.currentTarget.checked)}
            />
            <Switch
              label="Push Notifications"
              description="Receive push notifications on your device"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.currentTarget.checked)}
            />
            <Divider variant="dashed" />
            <Text size="sm" fw={600} c="dimmed" tt="uppercase">
              Notification Types
            </Text>
            <Switch
              label="New Mail Received"
              description="Get notified when new mail arrives"
              checked={notifyOnNewMail}
              onChange={(e) => setNotifyOnNewMail(e.currentTarget.checked)}
            />
            <Switch
              label="Scan Complete"
              description="Get notified when document scanning is complete"
              checked={notifyOnScanComplete}
              onChange={(e) => setNotifyOnScanComplete(e.currentTarget.checked)}
            />
            <Switch
              label="Mail Forwarded"
              description="Get notified when mail is forwarded"
              checked={notifyOnForward}
              onChange={(e) => setNotifyOnForward(e.currentTarget.checked)}
            />
            <Switch
              label="Team Activity"
              description="Get notified when team members perform actions"
              checked={notifyOnTeamActivity}
              onChange={(e) => setNotifyOnTeamActivity(e.currentTarget.checked)}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Forwarding Preferences */}
      <Paper withBorder p="xl" radius="md" style={{padding: "clamp(1rem, 4vw, 1.5rem)"}}>
        <Stack gap="md">
          <Group gap="sm">
            <IconMail size={24} />
            <Title order={2} size="h3">
              Forwarding Preferences
            </Title>
          </Group>
          <Divider />
          <Stack gap="md">
            <TextInput
              label="Default Forwarding Address"
              placeholder="123 Main St, City, Province ZIP"
              description="Address where mail should be forwarded when requested"
              value={forwardingAddress}
              onChange={(e) => setForwardingAddress(e.target.value)}
              leftSection={<IconMapPin size={18} />}
            />
            <Switch
              label="Auto-Forward Mail"
              description="Automatically forward all mail to the address above"
              checked={autoForward}
              onChange={(e) => setAutoForward(e.currentTarget.checked)}
            />
            {autoForward && (
              <Select
                label="Forwarding Frequency"
                description="How often should mail be forwarded?"
                value={forwardingFrequency}
                onChange={setForwardingFrequency}
                data={[
                  {value: "daily", label: "Daily"},
                  {value: "weekly", label: "Weekly"},
                  {value: "biweekly", label: "Bi-weekly"},
                  {value: "monthly", label: "Monthly"},
                ]}
              />
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Save Button */}
      <Group justify="flex-end">
        <Button size="md" onClick={handleSave} loading={loading} fullWidth hiddenFrom="sm">
          Save Changes
        </Button>
        <Button size="lg" onClick={handleSave} loading={loading} visibleFrom="sm">
          Save Changes
        </Button>
      </Group>
    </Stack>
  );
}

