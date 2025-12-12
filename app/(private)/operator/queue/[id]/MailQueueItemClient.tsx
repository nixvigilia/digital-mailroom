"use client";

import {useState, useEffect} from "react";
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
  Tabs,
  Select,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconScan,
  IconTruck,
  IconTrash,
  IconCheck,
  IconAlertCircle,
  IconUpload,
  IconFileText,
  IconExternalLink,
} from "@tabler/icons-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {notifications} from "@mantine/notifications";
import {
  processOpenScan,
  processForward,
  processShred,
} from "@/app/actions/operator-mail";

interface MailQueueItemClientProps {
  mailItem: {
    id: string;
    userId?: string;
    userName?: string | null;
    userType?: string;
    sender: string;
    subject?: string | null;
    receivedAt: Date;
    status: string;
    envelopeScanUrl?: string | null;
    hasFullScan: boolean;
    kycApproved: boolean;
    actionRequest: {
      id: string;
      type: string;
      status: string;
      priority: string;
      forwardAddress?: string | null;
      forwardTrackingNumber?: string | null;
      forward3PLName?: string | null;
      forwardTrackingUrl?: string | null;
      notes?: string | null;
    } | null;
  };
}

export function MailQueueItemClient({mailItem}: MailQueueItemClientProps) {
  const router = useRouter();
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [forwardingAddress, setForwardingAddress] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [threePLName, setThreePLName] = useState<string | null>(null);
  const [trackingUrl, setTrackingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("details");

  const common3PLProviders = [
    {value: "LBC Express", label: "LBC Express"},
    {value: "J&T Express", label: "J&T Express"},
    {value: "2GO Express", label: "2GO Express"},
    {value: "Flash Express", label: "Flash Express"},
    {value: "Ninja Van", label: "Ninja Van"},
    {value: "Grab Express", label: "Grab Express"},
    {value: "Lalamove", label: "Lalamove"},
    {value: "GoGo Express", label: "GoGo Express"},
    {value: "XDE Logistics", label: "XDE Logistics"},
    {value: "Entrego", label: "Entrego"},
    {value: "Other", label: "Other"},
  ];

  // Determine initial tab based on action request
  useEffect(() => {
    if (mailItem.actionRequest?.type === "OPEN_AND_SCAN") {
      setActiveTab("scan");
    } else if (mailItem.actionRequest?.type === "FORWARD") {
      setActiveTab("forward");
      // Set forwarding address from request if available
      if (mailItem.actionRequest.forwardAddress) {
        setForwardingAddress(mailItem.actionRequest.forwardAddress);
      }
    } else if (
      mailItem.actionRequest?.type === "SHRED" ||
      mailItem.actionRequest?.type === "DISPOSE"
    ) {
      setActiveTab("shred");
    }
  }, [mailItem.actionRequest?.type, mailItem.actionRequest?.forwardAddress]);

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
    try {
      const formData = new FormData();
      formData.append("mailId", mailItem.id);
      formData.append("file", scanFile);

      const result = await processOpenScan(formData);

      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        router.push("/operator/queue");
        router.refresh();
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
        message: "An unexpected error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
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

    if (!threePLName) {
      notifications.show({
        title: "Error",
        message: "Please select a 3PL provider",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("mailId", mailItem.id);
      formData.append("forwardingAddress", forwardingAddress);
      formData.append("trackingNumber", trackingNumber);
      formData.append("threePLName", threePLName);
      if (trackingUrl) {
        formData.append("trackingUrl", trackingUrl);
      }
      if (notes) {
        formData.append("notes", notes);
      }

      const result = await processForward(formData);

      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        router.push("/operator/queue");
        router.refresh();
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
        message: "An unexpected error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShred = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("mailId", mailItem.id);

      const result = await processShred(formData);

      if (result.success) {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
        router.push("/operator/queue");
        router.refresh();
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
        message: "An unexpected error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
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
            <Title
              order={1}
              fw={800}
              style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
            >
              Mail Item: {mailItem.id.substring(0, 8)}...
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
          This user's KYC/KYB verification is not approved. Please verify
          approval before processing this request.
          {mailItem.userId && (
            <Button
              component={Link}
              href={`/operator/approvals?userId=${mailItem.userId}`}
              variant="light"
              size="xs"
              mt="sm"
            >
              Review KYC/KYB
            </Button>
          )}
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
              disabled={mailItem.actionRequest?.type !== "OPEN_AND_SCAN"}
            >
              Scan Document
            </Tabs.Tab>
            <Tabs.Tab
              value="forward"
              leftSection={<IconTruck size={16} />}
              disabled={mailItem.actionRequest?.type !== "FORWARD"}
            >
              Forward Mail
            </Tabs.Tab>
            <Tabs.Tab
              value="shred"
              leftSection={<IconTrash size={16} />}
              disabled={
                mailItem.actionRequest?.type !== "SHRED" &&
                mailItem.actionRequest?.type !== "DISPOSE"
              }
            >
              Dispose Mail
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="details" pt="xl">
            <Stack gap="md">
              <Group justify="space-between">
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">
                    User
                  </Text>
                  <Text fw={500}>{mailItem.userName || "Unknown User"}</Text>
                  {mailItem.userType && (
                    <Badge size="sm" variant="outline">
                      {mailItem.userType}
                    </Badge>
                  )}
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
              {mailItem.subject && (
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">
                    Subject
                  </Text>
                  <Text>{mailItem.subject}</Text>
                </Stack>
              )}
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Received At
                </Text>
                <Text>{new Date(mailItem.receivedAt).toLocaleString()}</Text>
              </Stack>
              <Divider />
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Action Request
                </Text>
                {mailItem.actionRequest ? (
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
                ) : (
                  <Text c="dimmed" fs="italic">
                    No active action request
                  </Text>
                )}
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
                Upload the scanned document. Ensure the document is clear and
                all pages are included.
              </Alert>
              <FileButton
                onChange={setScanFile}
                accept="image/*,application/pdf"
              >
                {(props) => (
                  <Button
                    {...props}
                    leftSection={<IconUpload size={18} />}
                    variant="outline"
                  >
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
              <Alert icon={<IconAlertCircle size={16} />} color="blue">
                <Text size="sm" fw={600} mb={4}>
                  Mail Item: {mailItem.id}
                </Text>
                <Text size="xs" c="dimmed">
                  User: {mailItem.userName || "Unknown User"}
                </Text>
                <Text size="xs" c="dimmed">
                  Sender: {mailItem.sender}
                </Text>
              </Alert>

              <Textarea
                label="Forwarding Address"
                value={forwardingAddress}
                disabled
                minRows={2}
              />

              <Select
                label="3PL Provider"
                placeholder="Select shipping provider"
                required
                data={common3PLProviders}
                value={threePLName}
                onChange={(value) => setThreePLName(value)}
                searchable
                description="Select the third-party logistics provider used for shipping"
              />

              <TextInput
                label="Tracking Number"
                placeholder="Enter tracking number"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                description="Tracking number provided by the 3PL"
              />

              <TextInput
                label="Tracking URL"
                placeholder="https://www.lbcexpress.com/ or https://www.jtexpress.ph/track-and-trace"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                description="Link to the 3PL's tracking page (e.g., https://www.lbcexpress.com/, https://www.jtexpress.ph/track-and-trace)"
                leftSection={<IconExternalLink size={16} />}
              />

              <Textarea
                label="Notes (Optional)"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                minRows={3}
              />

              <Button
                onClick={handleForward}
                loading={loading}
                disabled={
                  !forwardingAddress ||
                  !trackingNumber ||
                  !threePLName ||
                  !mailItem.kycApproved
                }
                leftSection={<IconCheck size={18} />}
                fullWidth
                size="lg"
              >
                Complete Forward
              </Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="shred" pt="xl">
            <Stack gap="md">
              <Alert icon={<IconTrash size={16} />} color="red">
                <Text fw={600} mb="xs">
                  Warning: This action cannot be undone
                </Text>
                This action is permanent and cannot be undone. The physical mail
                will be securely disposed and destroyed.
              </Alert>
              <Group>
                <Badge
                  color={mailItem.kycApproved ? "green" : "red"}
                  variant="light"
                >
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
                Confirm Dispose
              </Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}
