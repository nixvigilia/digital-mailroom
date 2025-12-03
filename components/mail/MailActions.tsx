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
} from "@mantine/core";
import {
  IconScan,
  IconMailForward,
  IconLock,
  IconTrash,
  IconInfoCircle,
} from "@tabler/icons-react";
import {useState} from "react";

interface MailActionsProps {
  mailId: string;
  status: string;
  onActionComplete?: () => void;
}

export function MailActions({
  mailId,
  status,
  onActionComplete,
}: MailActionsProps) {
  const [openScanModal, setOpenScanModal] = useState(false);
  const [openForwardModal, setOpenForwardModal] = useState(false);
  const [openHoldModal, setOpenHoldModal] = useState(false);
  const [openShredModal, setOpenShredModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenScan = async () => {
    setLoading(true);
    // TODO: Backend integration
    console.log("Requesting full scan for:", mailId);
    setTimeout(() => {
      setLoading(false);
      setOpenScanModal(false);
      if (onActionComplete) onActionComplete();
    }, 1000);
  };

  const handleForward = async (address: string, notes: string) => {
    setLoading(true);
    // TODO: Backend integration
    console.log("Forwarding mail:", {mailId, address, notes});
    setTimeout(() => {
      setLoading(false);
      setOpenForwardModal(false);
      if (onActionComplete) onActionComplete();
    }, 1000);
  };

  const handleHold = async (reason: string) => {
    setLoading(true);
    // TODO: Backend integration
    console.log("Holding mail:", {mailId, reason});
    setTimeout(() => {
      setLoading(false);
      setOpenHoldModal(false);
      if (onActionComplete) onActionComplete();
    }, 1000);
  };

  const handleShred = async () => {
    setLoading(true);
    // TODO: Backend integration
    console.log("Shredding mail:", mailId);
    setTimeout(() => {
      setLoading(false);
      setOpenShredModal(false);
      if (onActionComplete) onActionComplete();
    }, 1000);
  };

  return (
    <>
      <Stack gap="md">
        <Text size="sm" fw={600} c="dimmed" tt="uppercase">
          Physical Actions
        </Text>
        <Group gap="sm" wrap="wrap">
          <Button
            leftSection={<IconScan size={18} />}
            variant="light"
            onClick={() => setOpenScanModal(true)}
            disabled={status === "scanned"}
            size="md"
            style={{flex: "1 1 calc(50% - 0.5rem)", minWidth: "calc(50% - 0.5rem)"}}
            visibleFrom="sm"
          >
            Open & Scan
          </Button>
          <Button
            leftSection={<IconScan size={18} />}
            variant="light"
            onClick={() => setOpenScanModal(true)}
            disabled={status === "scanned"}
            size="sm"
            style={{flex: "1 1 calc(50% - 0.5rem)", minWidth: "calc(50% - 0.5rem)"}}
            hiddenFrom="sm"
          >
            Open & Scan
          </Button>
          <Button
            leftSection={<IconMailForward size={18} />}
            variant="light"
            onClick={() => setOpenForwardModal(true)}
            size="md"
            style={{flex: "1 1 calc(50% - 0.5rem)", minWidth: "calc(50% - 0.5rem)"}}
            visibleFrom="sm"
          >
            Forward
          </Button>
          <Button
            leftSection={<IconMailForward size={18} />}
            variant="light"
            onClick={() => setOpenForwardModal(true)}
            size="sm"
            style={{flex: "1 1 calc(50% - 0.5rem)", minWidth: "calc(50% - 0.5rem)"}}
            hiddenFrom="sm"
          >
            Forward
          </Button>
          <Button
            leftSection={<IconLock size={18} />}
            variant="light"
            onClick={() => setOpenHoldModal(true)}
            size="md"
            style={{flex: "1 1 calc(50% - 0.5rem)", minWidth: "calc(50% - 0.5rem)"}}
            visibleFrom="sm"
          >
            Hold
          </Button>
          <Button
            leftSection={<IconLock size={18} />}
            variant="light"
            onClick={() => setOpenHoldModal(true)}
            size="sm"
            style={{flex: "1 1 calc(50% - 0.5rem)", minWidth: "calc(50% - 0.5rem)"}}
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
            style={{flex: "1 1 calc(50% - 0.5rem)", minWidth: "calc(50% - 0.5rem)"}}
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
            style={{flex: "1 1 calc(50% - 0.5rem)", minWidth: "calc(50% - 0.5rem)"}}
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
          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            Requesting a full scan will open the mail and scan all contents.
            This action cannot be undone.
          </Alert>
          <Text size="sm" c="dimmed">
            Our mailroom operator will open this mail item and scan all
            documents inside. You'll receive a notification when the scan is
            complete.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setOpenScanModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleOpenScan} loading={loading}>
              Request Scan
            </Button>
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
        <Stack gap="md">
          <Alert icon={<IconInfoCircle size={16} />} color="red">
            This action is permanent and cannot be undone. The physical mail
            will be securely shredded and destroyed.
          </Alert>
          <Text size="sm" c="dimmed">
            Are you sure you want to shred this mail item? All physical
            documents will be permanently destroyed.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setOpenShredModal(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleShred}
              loading={loading}
            >
              Confirm Shred
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

function ForwardForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (address: string, notes: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <Stack gap="md">
      <TextInput
        label="Forwarding Address"
        placeholder="123 Main St, City, State ZIP"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
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
          onClick={() => onSubmit(address, notes)}
          loading={loading}
          disabled={!address}
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

