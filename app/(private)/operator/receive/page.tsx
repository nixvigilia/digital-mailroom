"use client";

import {useState, useRef, useCallback} from "react";
import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  TextInput,
  FileButton,
  Select,
  NumberInput,
  Textarea,
  Grid,
  Avatar,
  Alert,
  Loader,
} from "@mantine/core";
import {
  IconMail,
  IconUpload,
  IconUser,
  IconBarcode,
  IconTruck,
  IconCheck,
  IconX,
  IconSearch,
} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";
import {
  searchUsers,
  createMailItem,
  type UserSearchResult,
} from "@/app/actions/operator-mail";
import {useDebouncedValue} from "@mantine/hooks";
import {useVirtualizer} from "@tanstack/react-virtual";
import Webcam from "react-webcam";
import {Modal} from "@mantine/core";

export default function ReceiveMailPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );

  const [formData, setFormData] = useState({
    sender: "",
    mailboxNumber: "",
    trackingNumber: "",
    barcode: "",
    postalMarks: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [scanModalOpen, setScanModalOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: searchResults.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 5,
  });

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Convert base64 to blob
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "webcam-scan.jpg", {
            type: "image/jpeg",
          });
          handleFileChange(file);
          setScanModalOpen(false);
        });
    }
  }, [webcamRef]);
  const handleFileChange = (file: File | null) => {
    setFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Search users effect
  useState(() => {
    const search = async () => {
      if (debouncedQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const result = await searchUsers(debouncedQuery);
        if (result.success && result.data) {
          setSearchResults(result.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    };

    if (debouncedQuery) search();
  }); // Note: this useEffect logic is slightly wrong, fixing it below

  // Correct Search Implementation
  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const result = await searchUsers(query);
      if (result.success && result.data) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!file || !selectedUser || !formData.sender) {
      notifications.show({
        title: "Validation Error",
        message:
          "Please upload an image, select a recipient, and enter sender name.",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("image", file);
      submitData.append("sender", formData.sender);
      submitData.append("profileId", selectedUser.id);

      // Add extra fields to be handled by action (stored in notes or separate fields)
      const notes = [
        formData.trackingNumber ? `Tracking: ${formData.trackingNumber}` : null,
        formData.barcode ? `Barcode: ${formData.barcode}` : null,
        formData.postalMarks ? `Marks: ${formData.postalMarks}` : null,
        formData.mailboxNumber ? `Mailbox: ${formData.mailboxNumber}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      if (notes) submitData.append("notes", notes);

      // Pass raw values too if action supports them
      if (formData.trackingNumber)
        submitData.append("trackingNumber", formData.trackingNumber);
      if (formData.barcode) submitData.append("barcode", formData.barcode);

      const result = await createMailItem(submitData);

      if (result.success) {
        notifications.show({
          title: "Success",
          message: "Mail item received successfully",
          color: "green",
        });
        // Reset form
        setFile(null);
        setPreviewUrl(null);
        setSelectedUser(null);
        setSearchQuery("");
        setFormData({
          sender: "",
          mailboxNumber: "",
          trackingNumber: "",
          barcode: "",
          postalMarks: "",
        });
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
      setSubmitting(false);
    }
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group gap="md" align="center">
          <IconMail size={32} color="var(--mantine-color-blue-6)" />
          <Title
            order={1}
            fw={800}
            style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
          >
            Receive Mail
          </Title>
        </Group>
        <Text c="dimmed" size="lg">
          Intake new physical mail items
        </Text>
      </Stack>

      <Grid>
        <Grid.Col span={{base: 12, md: 6}}>
          <Stack gap="md">
            {/* Step 1: Scan/Upload */}
            <Paper withBorder p="xl" radius="md">
              <Stack gap="md">
                <Group gap="sm">
                  <IconUpload size={24} />
                  <Title order={2} size="h3">
                    1. Envelope Scan
                  </Title>
                </Group>

                {previewUrl ? (
                  <Stack align="center">
                    <img
                      src={previewUrl}
                      alt="Envelope Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        borderRadius: "8px",
                      }}
                    />
                    <Button
                      color="red"
                      variant="light"
                      onClick={() => handleFileChange(null)}
                    >
                      Remove Image
                    </Button>
                  </Stack>
                ) : (
                  <Stack gap="xs">
                    <FileButton
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                    >
                      {(props) => (
                        <Button
                          {...props}
                          leftSection={<IconUpload size={18} />}
                          size="lg"
                          variant="outline"
                          fullWidth
                        >
                          Upload File
                        </Button>
                      )}
                    </FileButton>
                    <Button
                      leftSection={<IconUpload size={18} />}
                      size="lg"
                      fullWidth
                      onClick={() => setScanModalOpen(true)}
                    >
                      Use Camera
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Paper>

            <Modal
              opened={scanModalOpen}
              onClose={() => setScanModalOpen(false)}
              title="Scan with Camera"
              size="lg"
            >
              <Stack align="center" gap="md">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  videoConstraints={{
                    facingMode: "environment",
                  }}
                />
                <Button onClick={handleCapture} size="lg">
                  Capture Image
                </Button>
              </Stack>
            </Modal>

            {/* Step 2: Recipient */}
            <Paper withBorder p="xl" radius="md">
              <Stack gap="md">
                <Group gap="sm">
                  <IconUser size={24} />
                  <Title order={2} size="h3">
                    2. Recipient
                  </Title>
                </Group>

                {selectedUser ? (
                  <Alert
                    icon={<IconCheck size={16} />}
                    color="green"
                    title="Selected Recipient"
                    withCloseButton
                    onClose={() => setSelectedUser(null)}
                  >
                    <Text fw={700}>
                      {selectedUser.firstName} {selectedUser.lastName}
                    </Text>
                    <Text size="sm">{selectedUser.email}</Text>
                    {selectedUser.businessName && (
                      <Text size="xs" c="dimmed">
                        Business: {selectedUser.businessName}
                      </Text>
                    )}
                  </Alert>
                ) : (
                  <Stack>
                    <TextInput
                      label="Search Recipient"
                      placeholder="Name, Email, or Business Name"
                      leftSection={
                        searching ? (
                          <Loader size="xs" />
                        ) : (
                          <IconSearch size={16} />
                        )
                      }
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                      <div
                        ref={parentRef}
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                          border: "1px solid var(--mantine-color-gray-3)",
                          borderRadius: "var(--mantine-radius-sm)",
                        }}
                      >
                        <div
                          style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: "100%",
                            position: "relative",
                          }}
                        >
                          {rowVirtualizer
                            .getVirtualItems()
                            .map((virtualRow) => {
                              const user = searchResults[virtualRow.index];
                              return (
                                <div
                                  key={user.id}
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                    padding: "4px",
                                  }}
                                >
                                  <Paper
                                    withBorder
                                    p="sm"
                                    style={{cursor: "pointer", height: "100%"}}
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setSearchResults([]);
                                      setSearchQuery("");
                                    }}
                                  >
                                    <Group>
                                      <Avatar color="blue" radius="xl">
                                        {user.firstName?.[0]}
                                        {user.lastName?.[0]}
                                      </Avatar>
                                      <div style={{flex: 1}}>
                                        <Text size="sm" fw={500}>
                                          {user.firstName} {user.lastName}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                          {user.email}
                                        </Text>
                                        {user.businessName && (
                                          <Text size="xs" c="blue">
                                            {user.businessName}
                                          </Text>
                                        )}
                                      </div>
                                    </Group>
                                  </Paper>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </Stack>
                )}

                <TextInput
                  label="Mailbox Number (Optional)"
                  placeholder="e.g. 1001"
                  value={formData.mailboxNumber}
                  onChange={(e) =>
                    setFormData({...formData, mailboxNumber: e.target.value})
                  }
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{base: 12, md: 6}}>
          <Paper withBorder p="xl" radius="md" h="100%">
            <Stack gap="md">
              <Group gap="sm">
                <IconMail size={24} />
                <Title order={2} size="h3">
                  3. Mail Details
                </Title>
              </Group>

              <TextInput
                label="Sender Name"
                placeholder="e.g. Bank of America"
                required
                value={formData.sender}
                onChange={(e) =>
                  setFormData({...formData, sender: e.target.value})
                }
              />

              <TextInput
                label="Tracking Number"
                placeholder="Scan or type tracking number"
                leftSection={<IconTruck size={16} />}
                value={formData.trackingNumber}
                onChange={(e) =>
                  setFormData({...formData, trackingNumber: e.target.value})
                }
              />

              <TextInput
                label="Barcode / Reference"
                placeholder="Scan or type barcode"
                leftSection={<IconBarcode size={16} />}
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({...formData, barcode: e.target.value})
                }
              />

              <Textarea
                label="Postal Marks / Notes"
                placeholder="Any visible marks, stamps, or notes"
                minRows={3}
                value={formData.postalMarks}
                onChange={(e) =>
                  setFormData({...formData, postalMarks: e.target.value})
                }
              />

              <Button
                size="lg"
                fullWidth
                mt="xl"
                loading={submitting}
                onClick={handleSubmit}
                disabled={!file || !selectedUser || !formData.sender}
              >
                Receive & Log Mail
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
