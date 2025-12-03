"use client";

import {useState} from "react";
import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  Badge,
  Alert,
  Image,
  Divider,
  TextInput,
  Textarea,
  FileButton,
  Progress,
  Tabs,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconScan,
  IconTruck,
  IconTrash,
  IconCheck,
  IconAlertCircle,
  IconUpload,
  IconUserCheck,
  IconFileText,
} from "@tabler/icons-react";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {notifications} from "@mantine/notifications";

// Mock mail item data - will be replaced with backend
const mockMailItem = {
  id: "mail-123",
  userId: "user-1",
  userName: "John Doe",
  userType: "individual",
  sender: "BIR - Bureau of Internal Revenue",
  subject: "Tax Assessment Notice",
  receivedAt: new Date("2025-01-10T10:30:00"),
  status: "received",
  envelopeScanUrl: "/placeholder-envelope.jpg",
  hasFullScan: false,
  kycApproved: true,
  actionRequest: {
    id: "req-1",
    type: "scan",
    status: "pending",
    requestedAt: new Date("2025-01-15T08:00:00"),
    priority: "high",
  },
};

export default function MailItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mailItem] = useState(mockMailItem);
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [forwardingAddress, setForwardingAddress] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("details");

  const handleScan = async () => {
    if (!scanFile) {
      notifications.show({
        title: "Error",
        message: "Please upload a scanned document",
        color: "red",
      });
      return;
    }

    setLoading(true);
    // TODO: Implement actual scan upload
    setTimeout(() => {
      setLoading(false);
      notifications.show({
        title: "Success",
        message: "Document scanned and uploaded successfully",
        color: "green",
      });
      router.push("/operator/queue");
    }, 2000);
  };

  const handleForward = async () => {
    if (!forwardingAddress || !trackingNumber) {
      notifications.show({
        title: "Error",
        message: "Please fill in forwarding address and tracking number",
        color: "red",
      });
      return;
    }

    setLoading(true);
    // TODO: Implement actual forward processing
    setTimeout(() => {
      setLoading(false);
      notifications.show({
        title: "Success",
        message: "Mail forwarded successfully",
        color: "green",
      });
      router.push("/operator/queue");
    }, 2000);
  };

  const handleShred = async () => {
    setLoading(true);
    // TODO: Implement actual shred processing
    setTimeout(() => {
      setLoading(false);
      notifications.show({
        title: "Success",
        message: "Mail shredded successfully",
        color: "green",
      });
      router.push("/operator/queue");
    }, 2000);
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Group gap="md">
          <Button
            component={Link}
            href="/operator/queue"
            variant="subtle"
            leftSection={<IconArrowLeft size={18} />}
          >
            Back to Queue
          </Button>
          <Stack gap={4}>
            <Title order={1} fw={800} style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}>
              Mail Item: {mailItem.id}
            </Title>
            <Text c="dimmed" size="lg">
              Process action request
            </Text>
          </Stack>
        </Group>
      </Group>

      {/* KYC Approval Alert */}
      {!mailItem.kycApproved && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="KYC/KYB Not Approved"
        >
          This user's KYC/KYB verification is not approved. Please verify approval before
          processing this request.
          <Button
            component={Link}
            href={`/operator/approvals?userId=${mailItem.userId}`}
            variant="light"
            size="xs"
            mt="sm"
          >
            Review KYC/KYB
          </Button>
        </Alert>
      )}

      {/* Mail Item Details */}
      <Paper withBorder p="xl" radius="md">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="details" leftSection={<IconFileText size={16} />}>
              Details
            </Tabs.Tab>
            <Tabs.Tab
              value="scan"
              leftSection={<IconScan size={16} />}
              disabled={mailItem.actionRequest.type !== "scan"}
            >
              Scan Document
            </Tabs.Tab>
            <Tabs.Tab
              value="forward"
              leftSection={<IconTruck size={16} />}
              disabled={mailItem.actionRequest.type !== "forward"}
            >
              Forward Mail
            </Tabs.Tab>
            <Tabs.Tab
              value="shred"
              leftSection={<IconTrash size={16} />}
              disabled={mailItem.actionRequest.type !== "shred"}
            >
              Shred Mail
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="details" pt="xl">
            <Stack gap="md">
              <Group justify="space-between">
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">
                    User
                  </Text>
                  <Text fw={500}>{mailItem.userName}</Text>
                  <Badge size="sm" variant="outline">
                    {mailItem.userType}
                  </Badge>
                </Stack>
                <Stack gap={4} align="flex-end">
                  <Text size="sm" c="dimmed">
                    Status
                  </Text>
                  <Badge color="blue" variant="light">
                    {mailItem.status}
                  </Badge>
                </Stack>
              </Group>
              <Divider />
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Sender
                </Text>
                <Text fw={500}>{mailItem.sender}</Text>
              </Stack>
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Subject
                </Text>
                <Text>{mailItem.subject}</Text>
              </Stack>
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Received At
                </Text>
                <Text>{mailItem.receivedAt.toLocaleString()}</Text>
              </Stack>
              <Divider />
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Action Request
                </Text>
                <Group gap="xs">
                  <Badge color="blue" variant="light">
                    {mailItem.actionRequest.type}
                  </Badge>
                  <Badge color="yellow" variant="light">
                    {mailItem.actionRequest.status}
                  </Badge>
                  <Badge color="red" variant="light" size="sm">
                    {mailItem.actionRequest.priority} priority
                  </Badge>
                </Group>
              </Stack>
              {mailItem.envelopeScanUrl && (
                <>
                  <Divider />
                  <Stack gap={4}>
                    <Text size="sm" c="dimmed">
                      Envelope Scan
                    </Text>
                    <Image
                      src={mailItem.envelopeScanUrl}
                      alt="Envelope scan"
                      radius="md"
                      style={{maxWidth: 400}}
                    />
                  </Stack>
                </>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="scan" pt="xl">
            <Stack gap="md">
              <Alert icon={<IconScan size={16} />} color="blue">
                Upload the scanned document. Ensure the document is clear and all pages are
                included.
              </Alert>
              <FileButton onChange={setScanFile} accept="image/*,application/pdf">
                {(props) => (
                  <Button {...props} leftSection={<IconUpload size={18} />} variant="outline">
                    {scanFile ? scanFile.name : "Upload Scanned Document"}
                  </Button>
                )}
              </FileButton>
              {scanFile && (
                <Alert icon={<IconCheck size={16} />} color="green">
                  File selected: {scanFile.name}
                </Alert>
              )}
              <Button
                onClick={handleScan}
                loading={loading}
                disabled={!scanFile || !mailItem.kycApproved}
                leftSection={<IconCheck size={18} />}
                fullWidth
                size="lg"
              >
                Complete Scan & Update Status
              </Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="forward" pt="xl">
            <Stack gap="md">
              <Alert icon={<IconTruck size={16} />} color="blue">
                Enter the forwarding address and tracking information for the shipment.
              </Alert>
              <Textarea
                label="Forwarding Address"
                placeholder="Enter complete forwarding address"
                required
                minRows={3}
                value={forwardingAddress}
                onChange={(e) => setForwardingAddress(e.target.value)}
              />
              <TextInput
                label="Tracking Number"
                placeholder="Enter tracking number"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
              <Button
                onClick={handleForward}
                loading={loading}
                disabled={!forwardingAddress || !trackingNumber || !mailItem.kycApproved}
                leftSection={<IconCheck size={18} />}
                fullWidth
                size="lg"
              >
                Complete Forward & Update Status
              </Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="shred" pt="xl">
            <Stack gap="md">
              <Alert icon={<IconTrash size={16} />} color="red">
                <Text fw={600} mb="xs">
                  Warning: This action cannot be undone
                </Text>
                Once shredded, this mail item will be permanently destroyed. Please ensure
                you have verified the user's consent and KYC/KYB approval.
              </Alert>
              <Group>
                <Badge color={mailItem.kycApproved ? "green" : "red"} variant="light">
                  KYC/KYB: {mailItem.kycApproved ? "Approved" : "Not Approved"}
                </Badge>
              </Group>
              <Button
                onClick={handleShred}
                loading={loading}
                disabled={!mailItem.kycApproved}
                leftSection={<IconTrash size={18} />}
                color="red"
                fullWidth
                size="lg"
              >
                Confirm Shred & Update Status
              </Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}


