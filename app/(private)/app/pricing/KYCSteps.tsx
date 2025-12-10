"use client";

import {
  Stack,
  Alert,
  Group,
  TextInput,
  Select,
  SimpleGrid,
  Box,
  Text,
  FileButton,
  Button,
  Checkbox,
  Divider,
  Anchor,
  Card,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconUpload,
  IconCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

export interface KYCFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;

  // ID Verification
  idType: string;
  idFileFront: File | null;
  idFileFrontUrl: string | null;
  idFileBack: File | null;
  idFileBackUrl: string | null;

  // Consent & Agreement
  consentMailOpening: boolean;
  consentDataProcessing: boolean;
  consentTermsOfService: boolean;
  consentPrivacyPolicy: boolean;
}

export const initialKYCState: KYCFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  phoneNumber: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  country: "Philippines",
  idType: "",
  idFileFront: null,
  idFileFrontUrl: null,
  idFileBack: null,
  idFileBackUrl: null,
  consentMailOpening: false,
  consentDataProcessing: false,
  consentTermsOfService: false,
  consentPrivacyPolicy: false,
};

// Step 1: Personal Information
export function Step1PersonalInfo({
  formData,
  updateFormData,
}: {
  formData: KYCFormData;
  updateFormData: (field: keyof KYCFormData, value: any) => void;
}) {
  return (
    <Stack gap="lg">
      <Alert
        variant="light"
        color="blue"
        title="Information Required"
        icon={<IconAlertCircle size={16} />}
      >
        Please provide your accurate personal information. This will be used for
        mail delivery and account verification.
      </Alert>

      <Group grow>
        <TextInput
          label="First Name"
          placeholder="John"
          required
          value={formData.firstName}
          onChange={(e) => updateFormData("firstName", e.target.value)}
        />
        <TextInput
          label="Last Name"
          placeholder="Doe"
          required
          value={formData.lastName}
          onChange={(e) => updateFormData("lastName", e.target.value)}
        />
      </Group>

      <Group grow>
        <TextInput
          label="Date of Birth"
          type="date"
          required
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
        />
        <TextInput
          label="Phone Number"
          placeholder="+63 912 345 6789"
          required
          value={formData.phoneNumber}
          onChange={(e) => updateFormData("phoneNumber", e.target.value)}
        />
      </Group>

      <TextInput
        label="Street Address"
        placeholder="123 Rizal Street, Barangay Poblacion"
        required
        value={formData.address}
        onChange={(e) => updateFormData("address", e.target.value)}
      />

      <Group grow>
        <TextInput
          label="City/Municipality"
          placeholder="Manila"
          required
          value={formData.city}
          onChange={(e) => updateFormData("city", e.target.value)}
        />
        <TextInput
          label="Province"
          placeholder="Metro Manila"
          required
          value={formData.province}
          onChange={(e) => updateFormData("province", e.target.value)}
        />
        <TextInput
          label="Postal Code"
          placeholder="1000"
          required
          value={formData.postalCode}
          onChange={(e) => updateFormData("postalCode", e.target.value)}
        />
      </Group>

      <TextInput
        label="Country"
        value={formData.country}
        onChange={(e) => updateFormData("country", e.target.value)}
        disabled
      />
    </Stack>
  );
}

// Step 2: ID Verification
export function Step2IDVerification({
  formData,
  updateFormData,
}: {
  formData: KYCFormData;
  updateFormData: (field: keyof KYCFormData, value: any) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (file: File | null, side: "front" | "back") => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      notifications.show({
        title: "Invalid File Type",
        message: "Please upload a JPEG, PNG, or PDF file",
        color: "red",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: "File Too Large",
        message: "File size must be less than 5MB",
        color: "red",
      });
      return;
    }

    setUploading(true);
    if (side === "front") {
      updateFormData("idFileFront", file);
    } else {
      updateFormData("idFileBack", file);
    }

    // Simulate file upload
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      if (side === "front") {
        updateFormData("idFileFrontUrl", url);
      } else {
        updateFormData("idFileBackUrl", url);
      }
      setUploading(false);
      notifications.show({
        title: "File Uploaded",
        message: `ID document ${side} uploaded successfully`,
        color: "green",
      });
    }, 1000);
  };

  return (
    <Stack gap="lg">
      <Alert
        variant="light"
        color="blue"
        title="Document Upload"
        icon={<IconAlertCircle size={16} />}
      >
        Upload a clear photo or scan of a government-issued ID. Please select
        your ID type from the list below.
      </Alert>

      <Select
        label="ID Type"
        placeholder="Select your ID type"
        required
        data={[
          { value: "philpassport", label: "Philippine Passport (DFA)" },
          { value: "philsys", label: "Philippine National ID / PhilSys ID (PSA)" },
          { value: "drivers_license", label: "Driver's License (LTO)" },
          { value: "sss", label: "Social Security System (SSS) ID" },
          { value: "gsis_umid", label: "GSIS UMID Card" },
          { value: "tin", label: "Tax Identification Number (TIN) ID (BIR)" },
          { value: "voters", label: "Voter's ID / COMELEC Voter's Identification Card" },
          { value: "postal", label: "Postal ID (Philippine Postal Corporation)" },
          { value: "ofw", label: "OFW ID (DFA)" },
          { value: "philhealth", label: "PhilHealth ID (Philippine Health Insurance Corporation)" },
          { value: "seamans_book", label: "Seaman's Book (POEA)" },
          { value: "prc", label: "PRC ID (Professional Regulation Commission)" },
        ]}
        value={formData.idType}
        onChange={(value: string | null) =>
          updateFormData("idType", value || "")
        }
        searchable
        description="Select the type of government-issued ID you will upload"
      />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {/* Front of ID */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Front Side
          </Text>
          <Text size="xs" c="dimmed" mb="md">
            Upload a clear photo or scan of the front side (JPEG, PNG, or PDF,
            max 5MB)
          </Text>
          <Group>
            <FileButton
              onChange={(file) => handleFileUpload(file, "front")}
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              disabled={uploading}
            >
              {(props) => (
                <Button
                  {...props}
                  leftSection={<IconUpload size={16} />}
                  loading={uploading}
                  variant={formData.idFileFront ? "light" : "default"}
                  size="sm"
                >
                  {formData.idFileFront ? "Change File" : "Upload Front"}
                </Button>
              )}
            </FileButton>
            {formData.idFileFront && (
              <Button
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => {
                  updateFormData("idFileFront", null);
                  updateFormData("idFileFrontUrl", null);
                }}
              >
                Remove
              </Button>
            )}
          </Group>
          {formData.idFileFrontUrl &&
            formData.idFileFront?.type.startsWith("image/") && (
              <Box mt="md">
                <Text size="xs" fw={500} mb={4} c="dimmed">
                  Preview
                </Text>
                <Box
                  style={{
                    border: "1px solid var(--mantine-color-gray-3)",
                    borderRadius: "var(--mantine-radius-md)",
                    overflow: "hidden",
                    aspectRatio: "16/9",
                    backgroundColor: "var(--mantine-color-gray-0)",
                  }}
                >
                  <img
                    src={formData.idFileFrontUrl}
                    alt="ID Front Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            )}
        </Box>

        {/* Back of ID */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Back Side
          </Text>
          <Text size="xs" c="dimmed" mb="md">
            Upload a clear photo or scan of the back side (JPEG, PNG, or PDF,
            max 5MB)
          </Text>
          <Group>
            <FileButton
              onChange={(file) => handleFileUpload(file, "back")}
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              disabled={uploading}
            >
              {(props) => (
                <Button
                  {...props}
                  leftSection={<IconUpload size={16} />}
                  loading={uploading}
                  variant={formData.idFileBack ? "light" : "default"}
                  size="sm"
                >
                  {formData.idFileBack ? "Change File" : "Upload Back"}
                </Button>
              )}
            </FileButton>
            {formData.idFileBack && (
              <Button
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => {
                  updateFormData("idFileBack", null);
                  updateFormData("idFileBackUrl", null);
                }}
              >
                Remove
              </Button>
            )}
          </Group>
          {formData.idFileBackUrl &&
            formData.idFileBack?.type.startsWith("image/") && (
              <Box mt="md">
                <Text size="xs" fw={500} mb={4} c="dimmed">
                  Preview
                </Text>
                <Box
                  style={{
                    border: "1px solid var(--mantine-color-gray-3)",
                    borderRadius: "var(--mantine-radius-md)",
                    overflow: "hidden",
                    aspectRatio: "16/9",
                    backgroundColor: "var(--mantine-color-gray-0)",
                  }}
                >
                  <img
                    src={formData.idFileBackUrl}
                    alt="ID Back Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            )}
        </Box>
      </SimpleGrid>
    </Stack>
  );
}

// Step 3: Consent & Agreement
export function Step3Consent({
  formData,
  updateFormData,
}: {
  formData: KYCFormData;
  updateFormData: (field: keyof KYCFormData, value: any) => void;
}) {
  return (
    <Stack gap="lg">
      <Alert
        variant="light"
        color="blue"
        title="Terms & Conditions"
        icon={<IconAlertCircle size={16} />}
      >
        Please read and accept all consents to proceed with your verification.
      </Alert>

      <Divider label="Required Consents" labelPosition="left" />

      <Checkbox
        label="I consent to Keep PH - Digital Mailbox opening and scanning my mail"
        description="I authorize Keep PH - Digital Mailbox to open, scan, and digitize physical mail items addressed to me."
        checked={formData.consentMailOpening}
        onChange={(e) =>
          updateFormData("consentMailOpening", e.currentTarget.checked)
        }
        size="md"
      />

      <Checkbox
        label="I consent to data processing and storage"
        description={
          <>
            I agree to Keep PH - Digital Mailbox processing and storing my
            personal data and mail content in accordance with the{" "}
            <Anchor
              href="/terms/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              fw={500}
            >
              Privacy Policy
            </Anchor>
            .
          </>
        }
        checked={formData.consentDataProcessing}
        onChange={(e) =>
          updateFormData("consentDataProcessing", e.currentTarget.checked)
        }
        size="md"
      />

      <Checkbox
        label={
          <>
            I accept the{" "}
            <Anchor
              href="/terms/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              fw={600}
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </Anchor>
          </>
        }
        description="I have read and agree to the Terms of Service governing the use of Keep PH - Digital Mailbox services."
        checked={formData.consentTermsOfService}
        onChange={(e) =>
          updateFormData("consentTermsOfService", e.currentTarget.checked)
        }
        size="md"
      />

      <Checkbox
        label={
          <>
            I accept the{" "}
            <Anchor
              href="/terms/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              fw={600}
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </Anchor>
          </>
        }
        description="I have read and agree to the Privacy Policy regarding how my data is collected, used, and protected."
        checked={formData.consentPrivacyPolicy}
        onChange={(e) =>
          updateFormData("consentPrivacyPolicy", e.currentTarget.checked)
        }
        size="md"
      />
    </Stack>
  );
}

// Review Component (Read-Only)
export function KYCReview({ formData }: { formData: KYCFormData }) {
    return (
        <Stack gap="md">
        <Box>
          <Text size="sm" fw={600} c="dimmed" mb="xs" tt="uppercase">
            Personal Information
          </Text>
          <Card withBorder padding="md" radius="md">
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="xs">
              <Text size="sm">
                <Text span c="dimmed">
                  Name:
                </Text>{" "}
                {formData.firstName} {formData.lastName}
              </Text>
              <Text size="sm">
                <Text span c="dimmed">
                  Birth Date:
                </Text>{" "}
                {formData.dateOfBirth}
              </Text>
              <Text size="sm">
                <Text span c="dimmed">
                  Phone:
                </Text>{" "}
                {formData.phoneNumber}
              </Text>
              <Text size="sm">
                <Text span c="dimmed">
                  Address:
                </Text>{" "}
                {formData.address}, {formData.city}, {formData.province}{" "}
                {formData.postalCode}
              </Text>
            </SimpleGrid>
          </Card>
        </Box>

        <Box>
          <Text size="sm" fw={600} c="dimmed" mb="xs" tt="uppercase">
            ID Verification
          </Text>
          <Card withBorder padding="md" radius="md">
            <Stack gap="xs">
              <Text size="sm">
                <Text span c="dimmed">
                  ID Type:
                </Text>{" "}
                {formData.idType || "Not selected"}
              </Text>
              <Group>
                <Text size="sm">
                  <Text span c="dimmed">
                    Front:
                  </Text>{" "}
                  {formData.idFileFront || formData.idFileFrontUrl ? (
                    <Text span c="green" fw={500}>
                      Attached
                    </Text>
                  ) : (
                    <Text span c="red">
                      Missing
                    </Text>
                  )}
                </Text>
                <Text size="sm">
                  <Text span c="dimmed">
                    Back:
                  </Text>{" "}
                  {formData.idFileBack || formData.idFileBackUrl ? (
                    <Text span c="green" fw={500}>
                      Attached
                    </Text>
                  ) : (
                    <Text span c="red">
                      Missing
                    </Text>
                  )}
                </Text>
              </Group>
            </Stack>
          </Card>
        </Box>

        <Box>
          <Text size="sm" fw={600} c="dimmed" mb="xs" tt="uppercase">
            Consents
          </Text>
          <Card withBorder padding="md" radius="md">
            <Stack gap="xs">
              <Group gap="xs">
                <ThemeIcon color="green" size="xs" variant="light">
                  <IconCheck size={10} />
                </ThemeIcon>
                <Text size="sm">Mail Opening Consent</Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon color="green" size="xs" variant="light">
                  <IconCheck size={10} />
                </ThemeIcon>
                <Text size="sm">Data Processing Consent</Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon color="green" size="xs" variant="light">
                  <IconCheck size={10} />
                </ThemeIcon>
                <Text size="sm">Terms of Service</Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon color="green" size="xs" variant="light">
                  <IconCheck size={10} />
                </ThemeIcon>
                <Text size="sm">Privacy Policy</Text>
              </Group>
            </Stack>
          </Card>
        </Box>
      </Stack>
    )
}

