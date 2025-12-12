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
  SimpleGrid,
} from "@mantine/core";
import {
  IconScan,
  IconMailForward,
  IconLock,
  IconTrash,
  IconInfoCircle,
  IconShieldLock,
  IconFileText,
} from "@tabler/icons-react";
import {useState, useEffect} from "react";
import {notifications} from "@mantine/notifications";
import {
  requestOpenScan,
  requestForward,
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
  hasFullScan?: boolean;
  isForwarded?: boolean;
  pendingScanRequest?: {
    status: string;
    requestedAt: Date;
  } | null;
  pendingForwardRequest?: {
    status: string;
    requestedAt: Date;
  } | null;
  pendingDisposeRequest?: {
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
  hasFullScan = false,
  isForwarded = false,
  pendingScanRequest = null,
  pendingForwardRequest = null,
  pendingDisposeRequest = null,
}: MailActionsProps) {
  const [openScanModal, setOpenScanModal] = useState(false);
  const [openForwardModal, setOpenForwardModal] = useState(false);
  const [openDisposeModal, setOpenDisposeModal] = useState(false);
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

  const handleDispose = async (pin: string) => {
    setLoading(true);
    try {
      const result = await requestShred(mailId, pin);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        setOpenDisposeModal(false);
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
        {pendingForwardRequest && (
          <Alert icon={<IconInfoCircle size={16} />} color="yellow">
            <Text fw={600} size="sm" mb={4}>
              Forward Request{" "}
              {pendingForwardRequest.status === "PENDING"
                ? "Pending"
                : "In Progress"}
            </Text>
            <Text size="xs" c="dimmed">
              A forward request was submitted on{" "}
              {new Date(pendingForwardRequest.requestedAt).toLocaleString()}.
              The operator will process your request and notify you when
              complete.
            </Text>
          </Alert>
        )}
        {pendingDisposeRequest && (
          <Alert icon={<IconInfoCircle size={16} />} color="yellow">
            <Text fw={600} size="sm" mb={4}>
              Dispose Request{" "}
              {pendingDisposeRequest.status === "PENDING"
                ? "Pending"
                : "In Progress"}
            </Text>
            <Text size="xs" c="dimmed">
              A dispose request was submitted on{" "}
              {new Date(pendingDisposeRequest.requestedAt).toLocaleString()}.
              The operator will process your request and notify you when
              complete.
            </Text>
          </Alert>
        )}
        <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="md">
          <Button
            leftSection={<IconFileText size={18} />}
            variant="light"
            color={
              hasFullScan || status === "scanned"
                ? "gray"
                : pendingScanRequest
                ? "yellow"
                : pendingDisposeRequest
                ? "gray"
                : "blue"
            }
            size="md"
            fullWidth
            onClick={() => {
              if (
                !hasFullScan &&
                status !== "scanned" &&
                !pendingScanRequest &&
                !pendingDisposeRequest
              ) {
                setOpenScanModal(true);
              }
            }}
            disabled={
              hasFullScan ||
              status === "scanned" ||
              status !== "received" ||
              !!pendingScanRequest ||
              !!pendingDisposeRequest
            }
            style={{
              backgroundColor:
                hasFullScan || status === "scanned"
                  ? "var(--mantine-color-gray-1)"
                  : pendingScanRequest
                  ? "var(--mantine-color-yellow-0)"
                  : pendingDisposeRequest
                  ? "var(--mantine-color-gray-1)"
                  : "var(--mantine-color-blue-0)",
              color:
                hasFullScan || status === "scanned"
                  ? "var(--mantine-color-gray-6)"
                  : pendingScanRequest
                  ? "var(--mantine-color-yellow-7)"
                  : pendingDisposeRequest
                  ? "var(--mantine-color-gray-6)"
                  : "var(--mantine-color-blue-6)",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            {hasFullScan || status === "scanned"
              ? "Document scanned"
              : pendingScanRequest
              ? "Processing"
              : pendingDisposeRequest
              ? "Unavailable"
              : "Open & Scan"}
          </Button>
          <Button
            leftSection={<IconMailForward size={18} />}
            variant="light"
            color={
              isForwarded
                ? "gray"
                : pendingForwardRequest || pendingDisposeRequest
                ? "gray"
                : "blue"
            }
            size="md"
            fullWidth
            onClick={() => {
              if (
                !isForwarded &&
                !pendingForwardRequest &&
                !pendingDisposeRequest
              ) {
                setOpenForwardModal(true);
              }
            }}
            disabled={
              isForwarded || !!pendingForwardRequest || !!pendingDisposeRequest
            }
            style={{
              backgroundColor: isForwarded
                ? "var(--mantine-color-gray-1)"
                : pendingForwardRequest || pendingDisposeRequest
                ? "var(--mantine-color-gray-1)"
                : "var(--mantine-color-blue-0)",
              color: isForwarded
                ? "var(--mantine-color-gray-6)"
                : pendingForwardRequest || pendingDisposeRequest
                ? "var(--mantine-color-gray-6)"
                : "var(--mantine-color-blue-6)",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            {isForwarded
              ? "Item sent"
              : pendingForwardRequest
              ? "Processing"
              : pendingDisposeRequest
              ? "Unavailable"
              : "Forward"}
          </Button>
          <Button
            leftSection={<IconTrash size={18} />}
            variant="light"
            color={
              pendingDisposeRequest || isForwarded || pendingForwardRequest
                ? "gray"
                : "red"
            }
            size="md"
            fullWidth
            onClick={() => {
              if (
                !pendingDisposeRequest &&
                !isForwarded &&
                !pendingForwardRequest
              ) {
                setOpenDisposeModal(true);
              }
            }}
            disabled={
              !!pendingDisposeRequest ||
              isForwarded ||
              !!pendingForwardRequest
            }
            style={{
              backgroundColor:
                pendingDisposeRequest || isForwarded || pendingForwardRequest
                  ? "var(--mantine-color-gray-1)"
                  : "var(--mantine-color-red-0)",
              color:
                pendingDisposeRequest || isForwarded || pendingForwardRequest
                  ? "var(--mantine-color-gray-6)"
                  : "var(--mantine-color-red-7)",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            {pendingDisposeRequest
              ? "Processing"
              : isForwarded || pendingForwardRequest
              ? "Unavailable"
              : "Dispose"}
          </Button>
        </SimpleGrid>
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

      {/* Dispose Modal */}
      <Modal
        opened={openDisposeModal}
        onClose={() => setOpenDisposeModal(false)}
        title="Dispose Mail"
      >
        <DisposeForm
          onSubmit={handleDispose}
          onCancel={() => setOpenDisposeModal(false)}
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

function DisposeForm({
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
          This action is permanent and cannot be undone. The physical mail will
          be securely disposed and destroyed. To securely dispose of mail,
          please set up a 4-digit PIN in your Settings page first. This prevents
          accidental deletions.
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
        securely disposed and destroyed.
      </Alert>
      <Text size="sm" c="dimmed">
        Please enter your 4-digit PIN to confirm disposal.
      </Text>

      <PasswordInput
        label="Security PIN *"
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
          Confirm Dispose
        </Button>
      </Group>
    </Stack>
  );
}
