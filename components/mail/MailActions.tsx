"use client";

import {
  Group,
  Button,
  Stack,
  Text,
  Modal,
  TextInput,
  Textarea,
  Select,
  Alert,
  PasswordInput,
  SegmentedControl,
  Card,
} from "@mantine/core";
import {
  IconScan,
  IconMailForward,
  IconLock,
  IconTrash,
  IconInfoCircle,
  IconShieldLock,
} from "@tabler/icons-react";
import {useState, useEffect} from "react";
import {notifications} from "@mantine/notifications";
import {
  requestOpenScan,
  requestForward,
  requestHold,
  requestShred,
} from "@/app/actions/mail-actions";
import {getSettings} from "@/app/actions/settings";
import Link from "next/link";

interface MailActionsProps {
  mailId: string;
  status: string;
  onActionComplete?: () => void;
  defaultForwardAddress?: string;
  hasShreddingPin?: boolean;
  pendingScanRequest?: {
    status: string;
    requestedAt: Date;
  } | null;
}

export function MailActions({
  mailId,
  status,
  onActionComplete,
  defaultForwardAddress = "",
  hasShreddingPin = false,
  pendingScanRequest = null,
}: MailActionsProps) {
  const [openScanModal, setOpenScanModal] = useState(false);
  const [openForwardModal, setOpenForwardModal] = useState(false);
  const [openHoldModal, setOpenHoldModal] = useState(false);
  const [openShredModal, setOpenShredModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenScan = async () => {
    setLoading(true);
    try {
      const result = await requestOpenScan(mailId);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        setOpenScanModal(false);
        if (onActionComplete) onActionComplete();
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
        message: "An error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async (address: string, notes: string) => {
    setLoading(true);
    try {
      const result = await requestForward(mailId, address, notes);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        setOpenForwardModal(false);
        if (onActionComplete) onActionComplete();
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
        message: "An error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHold = async (reason: string) => {
    setLoading(true);
    try {
      const result = await requestHold(mailId, reason);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        setOpenHoldModal(false);
        if (onActionComplete) onActionComplete();
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
        message: "An error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShred = async (pin: string) => {
    setLoading(true);
    try {
      const result = await requestShred(mailId, pin);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        setOpenShredModal(false);
        if (onActionComplete) onActionComplete();
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
        message: "An error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack gap="md">
        {pendingScanRequest && (
          <Alert icon={<IconInfoCircle size={16} />} color="yellow">
            <Text fw={600} size="sm" mb={4}>
              Scan Request{" "}
              {pendingScanRequest.status === "PENDING"
                ? "Pending"
                : "In Progress"}
            </Text>
            <Text size="xs" c="dimmed">
              A scan request was submitted on{" "}
              {new Date(pendingScanRequest.requestedAt).toLocaleString()}. The
              operator will process your request and notify you when complete.
            </Text>
          </Alert>
        )}
        <Text size="sm" fw={600} c="dimmed" tt="uppercase">
          Physical Actions
        </Text>
        <Group gap="sm" wrap="wrap">
          <Button
            leftSection={<IconScan size={18} />}
            variant="light"
            onClick={() => setOpenScanModal(true)}
            disabled={status !== "received" || !!pendingScanRequest}
            size="md"
            style={{
              flex: "1 1 calc(50% - 0.5rem)",
              minWidth: "calc(50% - 0.5rem)",
            }}
            visibleFrom="sm"
          >
            Open & Scan
          </Button>
          <Button
            leftSection={<IconScan size={18} />}
            variant="light"
            onClick={() => setOpenScanModal(true)}
            disabled={status !== "received" || !!pendingScanRequest}
            size="sm"
            style={{
              flex: "1 1 calc(50% - 0.5rem)",
              minWidth: "calc(50% - 0.5rem)",
            }}
            hiddenFrom="sm"
          >
            Open & Scan
          </Button>
          <Button
            leftSection={<IconMailForward size={18} />}
            variant="light"
            onClick={() => setOpenForwardModal(true)}
            size="md"
            style={{
              flex: "1 1 calc(50% - 0.5rem)",
              minWidth: "calc(50% - 0.5rem)",
            }}
            visibleFrom="sm"
          >
            Forward
          </Button>
          <Button
            leftSection={<IconMailForward size={18} />}
            variant="light"
            onClick={() => setOpenForwardModal(true)}
            size="sm"
            style={{
              flex: "1 1 calc(50% - 0.5rem)",
              minWidth: "calc(50% - 0.5rem)",
            }}
            hiddenFrom="sm"
          >
            Forward
          </Button>
          <Button
            leftSection={<IconLock size={18} />}
            variant="light"
            onClick={() => setOpenHoldModal(true)}
            size="md"
            style={{
              flex: "1 1 calc(50% - 0.5rem)",
              minWidth: "calc(50% - 0.5rem)",
            }}
            visibleFrom="sm"
          >
            Hold
          </Button>
          <Button
            leftSection={<IconLock size={18} />}
            variant="light"
            onClick={() => setOpenHoldModal(true)}
            size="sm"
            style={{
              flex: "1 1 calc(50% - 0.5rem)",
              minWidth: "calc(50% - 0.5rem)",
            }}
            hiddenFrom="sm"
          >
            Hold
          </Button>
          <Button
            leftSection={<IconTrash size={18} />}
            variant="light"
            color="red"
            onClick={() => setOpenShredModal(true)}
            size="md"
            style={{
              flex: "1 1 calc(50% - 0.5rem)",
              minWidth: "calc(50% - 0.5rem)",
            }}
            visibleFrom="sm"
          >
            Shred
          </Button>
          <Button
            leftSection={<IconTrash size={18} />}
            variant="light"
            color="red"
            onClick={() => setOpenShredModal(true)}
            size="sm"
            style={{
              flex: "1 1 calc(50% - 0.5rem)",
              minWidth: "calc(50% - 0.5rem)",
            }}
            hiddenFrom="sm"
          >
            Shred
          </Button>
        </Group>
      </Stack>

      {/* Open & Scan Modal */}
      <Modal
        opened={openScanModal}
        onClose={() => setOpenScanModal(false)}
        title="Request Full Document Scan"
      >
        <Stack gap="md">
          {pendingScanRequest ? (
            <Alert icon={<IconInfoCircle size={16} />} color="yellow">
              <Text fw={600} mb="xs">
                Scan Request Already Pending
              </Text>
              <Text size="sm">
                You already have a {pendingScanRequest.status.toLowerCase()}{" "}
                scan request for this mail item. It was requested on{" "}
                {new Date(pendingScanRequest.requestedAt).toLocaleString()}.
                Please wait for the operator to process your request.
              </Text>
            </Alert>
          ) : (
            <>
          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            Requesting a full scan will open the mail and scan all contents.
            This action cannot be undone.
          </Alert>
          <Text size="sm" c="dimmed">
            Our mailroom operator will open this mail item and scan all
            documents inside. You'll receive a notification when the scan is
            complete.
          </Text>
            </>
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setOpenScanModal(false)}>
              {pendingScanRequest ? "Close" : "Cancel"}
            </Button>
            {!pendingScanRequest && (
            <Button onClick={handleOpenScan} loading={loading}>
              Request Scan
            </Button>
            )}
          </Group>
        </Stack>
      </Modal>

      {/* Forward Modal */}
      <Modal
        opened={openForwardModal}
        onClose={() => setOpenForwardModal(false)}
        title="Forward Mail"
      >
        <ForwardForm
          onSubmit={handleForward}
          onCancel={() => setOpenForwardModal(false)}
          loading={loading}
          initialAddress={defaultForwardAddress}
        />
      </Modal>

      {/* Hold Modal */}
      <Modal
        opened={openHoldModal}
        onClose={() => setOpenHoldModal(false)}
        title="Hold Mail"
      >
        <HoldForm
          onSubmit={handleHold}
          onCancel={() => setOpenHoldModal(false)}
          loading={loading}
        />
      </Modal>

      {/* Shred Modal */}
      <Modal
        opened={openShredModal}
        onClose={() => setOpenShredModal(false)}
        title="Shred Mail"
      >
        <ShredForm
          onSubmit={handleShred}
          onCancel={() => setOpenShredModal(false)}
          loading={loading}
          hasPin={hasShreddingPin}
        />
      </Modal>
    </>
  );
}

function ForwardForm({
  onSubmit,
  onCancel,
  loading,
  initialAddress = "",
}: {
  onSubmit: (address: string, notes: string) => void;
  onCancel: () => void;
  loading: boolean;
  initialAddress?: string;
}) {
  const [addressMode, setAddressMode] = useState<"default" | "manual">(
    initialAddress ? "default" : "manual"
  );
  const [defaultAddress, setDefaultAddress] = useState(initialAddress);
  const [manualAddress, setManualAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Fetch default address from settings if not provided
  useEffect(() => {
    if (!initialAddress) {
      setLoadingSettings(true);
      getSettings()
        .then((result) => {
          if (result.success && result.data?.defaultForwardAddress) {
            setDefaultAddress(result.data.defaultForwardAddress);
            // If default exists, use it as the default mode
            if (result.data.defaultForwardAddress) {
              setAddressMode("default");
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching settings:", error);
        })
        .finally(() => {
          setLoadingSettings(false);
        });
    }
  }, [initialAddress]);

  const handleSubmit = () => {
    const addressToUse =
      addressMode === "default" ? defaultAddress : manualAddress;
    if (addressToUse) {
      onSubmit(addressToUse, notes);
    }
  };

  const currentAddress =
    addressMode === "default" ? defaultAddress : manualAddress;
  const hasDefaultAddress = !!defaultAddress;

  return (
    <Stack gap="md">
      {hasDefaultAddress && (
        <SegmentedControl
          value={addressMode}
          onChange={(value) => setAddressMode(value as "default" | "manual")}
          data={[
            {label: "Use Default Address", value: "default"},
            {label: "Enter Manual Address", value: "manual"},
          ]}
          fullWidth
        />
      )}

      {addressMode === "default" && hasDefaultAddress ? (
        <Card withBorder padding="md" radius="md">
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Default Forwarding Address
            </Text>
            <Text size="sm" c="dimmed">
              {defaultAddress}
            </Text>
            <Text size="xs" c="dimmed" mt="xs">
              You can change your default address in{" "}
              <Link
                href="/app/settings"
                style={{textDecoration: "underline", color: "inherit"}}
              >
                Settings
              </Link>
            </Text>
          </Stack>
        </Card>
      ) : (
      <TextInput
        label="Forwarding Address"
        placeholder="123 Main St, City, State ZIP"
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
        required
          disabled={loadingSettings}
      />
      )}

      <Textarea
        label="Notes (Optional)"
        placeholder="Any special instructions..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />

      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!currentAddress || loadingSettings}
        >
          Forward Mail
        </Button>
      </Group>
    </Stack>
  );
}

function HoldForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <Stack gap="md">
      <Textarea
        label="Reason for Hold"
        placeholder="Why are you holding this mail?"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        required
      />
      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(reason)}
          loading={loading}
          disabled={!reason}
        >
          Hold Mail
        </Button>
      </Group>
    </Stack>
  );
}

function ShredForm({
  onSubmit,
  onCancel,
  loading,
  hasPin,
}: {
  onSubmit: (pin: string) => void;
  onCancel: () => void;
  loading: boolean;
  hasPin: boolean;
}) {
  const [pin, setPin] = useState("");

  if (!hasPin) {
    return (
      <Stack gap="md">
        <Alert icon={<IconShieldLock size={16} />} color="orange">
          You haven't set a security PIN yet.
        </Alert>
        <Text size="sm">
          To securely shred mail, please set up a 4-digit PIN in your Settings
          page first. This prevents accidental deletions.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onCancel}>
            Close
          </Button>
          <Link href="/app/settings" style={{textDecoration: "none"}}>
            <Button>Go to Settings</Button>
          </Link>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Alert icon={<IconInfoCircle size={16} />} color="red">
        This action is permanent and cannot be undone. The physical mail will be
        securely shredded and destroyed.
      </Alert>
      <Text size="sm" c="dimmed">
        Please enter your 4-digit PIN to confirm shredding.
      </Text>

      <PasswordInput
        label="Security PIN"
        placeholder="Enter 4-digit PIN"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        required
        autoFocus
      />

      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={() => onSubmit(pin)}
          loading={loading}
          disabled={!pin || pin.length !== 4}
        >
          Confirm Shred
        </Button>
      </Group>
    </Stack>
  );
}
