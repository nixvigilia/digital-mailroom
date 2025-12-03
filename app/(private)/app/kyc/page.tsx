"use client";

import {useState, useEffect} from "react";
import {
  Title,
  Text,
  Stack,
  Paper,
  TextInput,
  Button,
  Stepper,
  Group,
  FileButton,
  Alert,
  Checkbox,
  Divider,
  Box,
  Progress,
  Select,
  Anchor,
  Container,
  Card,
  SimpleGrid,
  ThemeIcon,
} from "@mantine/core";
import {
  IconUser,
  IconId,
  IconFileText,
  IconCheck,
  IconAlertCircle,
  IconUpload,
} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";
import {useRouter} from "next/navigation";
import {submitKYC} from "@/app/actions/kyc";

// Using API route for GET request
async function getKYCStatus() {
  try {
    const response = await fetch("/api/kyc/status", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return {status: "NOT_STARTED", data: null};
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return {status: "NOT_STARTED", data: null};
  }
}

interface KYCFormData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;

  // Step 2: ID Verification
  idType: string;
  idFileFront: File | null;
  idFileFrontUrl: string | null;
  idFileBack: File | null;
  idFileBackUrl: string | null;

  // Step 3: Consent & Agreement
  consentMailOpening: boolean;
  consentDataProcessing: boolean;
  consentTermsOfService: boolean;
  consentPrivacyPolicy: boolean;
}

export default function KYCPage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatusState] = useState<string>("NOT_STARTED");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [formData, setFormData] = useState<KYCFormData>({
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
  });

  useEffect(() => {
    const checkStatus = async () => {
      const {status, data} = await getKYCStatus();
      setKycStatusState(status);

      if (data) {
        setRejectionReason(data.rejection_reason || null);
        setFormData((prev) => ({
          ...prev,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          dateOfBirth: data.date_of_birth
            ? new Date(data.date_of_birth).toISOString().split("T")[0]
            : "",
          phoneNumber: data.phone_number || "",
          address: data.address || "",
          city: data.city || "",
          province: data.province || "",
          postalCode: data.postal_code || "",
          country: data.country || "Philippines",
          idType: data.id_type || "",
          consentMailOpening: data.consent_mail_opening || false,
          consentDataProcessing: data.consent_data_processing || false,
          consentTermsOfService: data.consent_terms_of_service || false,
          consentPrivacyPolicy: data.consent_privacy_policy || false,
          // Set URL previews if available
          idFileFrontUrl: data.id_file_front_signed_url || null,
          idFileBackUrl: data.id_file_back_signed_url || null,
        }));
      }

      if (status === "APPROVED") {
        router.push("/app");
      } else if (status === "PENDING") {
        setActive(3); // Show review step if pending
      }
    };
    checkStatus();
  }, [router]);

  const updateFormData = (field: keyof KYCFormData, value: any) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const nextStep = () => {
    if (active === 0) {
      // Validate Step 1
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.dateOfBirth ||
        !formData.phoneNumber ||
        !formData.address ||
        !formData.city ||
        !formData.province ||
        !formData.postalCode
      ) {
        notifications.show({
          title: "Validation Error",
          message: "Please fill in all required fields",
          color: "red",
        });
        return;
      }
    } else if (active === 1) {
      // Validate Step 2
      if (!formData.idType || !formData.idFileFront || !formData.idFileBack) {
        notifications.show({
          title: "Validation Error",
          message:
            "Please select ID type and upload both front and back of ID document",
          color: "red",
        });
        return;
      }
    } else if (active === 2) {
      // Validate Step 3
      if (
        !formData.consentMailOpening ||
        !formData.consentDataProcessing ||
        !formData.consentTermsOfService ||
        !formData.consentPrivacyPolicy
      ) {
        notifications.show({
          title: "Validation Error",
          message: "Please accept all required consents",
          color: "red",
        });
        return;
      }
    }
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Prepare FormData to send files and data
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("province", formData.province);
      formDataToSend.append("postalCode", formData.postalCode);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("idType", formData.idType);
      formDataToSend.append(
        "consentMailOpening",
        String(formData.consentMailOpening)
      );
      formDataToSend.append(
        "consentDataProcessing",
        String(formData.consentDataProcessing)
      );
      formDataToSend.append(
        "consentTermsOfService",
        String(formData.consentTermsOfService)
      );
      formDataToSend.append(
        "consentPrivacyPolicy",
        String(formData.consentPrivacyPolicy)
      );

      if (formData.idFileFront) {
        formDataToSend.append("idFileFront", formData.idFileFront);
      }
      if (formData.idFileBack) {
        formDataToSend.append("idFileBack", formData.idFileBack);
      }

      const result = await submitKYC(formDataToSend);

      if (result.success) {
        notifications.show({
          title: "KYC Submitted",
          message: result.message,
          color: "green",
          icon: <IconCheck size={18} />,
        });

        setKycStatusState("PENDING");

        // Redirect to inbox after submission (will be blocked until approved)
        setTimeout(() => {
          router.push("/app");
        }, 2000);
      } else {
        notifications.show({
          title: "Submission Failed",
          message: result.message,
          color: "red",
          icon: <IconAlertCircle size={18} />,
        });
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);
      notifications.show({
        title: "Error",
        message: "Failed to submit KYC verification. Please try again.",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
        {/* Header */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={4}>
            <Title order={1} fw={800} size="h2">
              Identity Verification
            </Title>
            <Text c="dimmed" size="sm">
              Complete your KYC to start using mailroom services
            </Text>
          </Stack>
        </Group>

        {kycStatus === "PENDING" && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="yellow"
            variant="filled"
            title="Verification Pending"
          >
            Your KYC verification is pending review. You'll be notified once
            approved.
          </Alert>
        )}
        {kycStatus === "REJECTED" && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="filled"
            title="Verification Rejected"
          >
            Your KYC verification was rejected.
            {rejectionReason && (
              <>
                <br />
                <strong>Reason:</strong> {rejectionReason}
              </>
            )}
            <br />
            Please review and resubmit your information.
          </Alert>
        )}

        {/* Progress Indicator */}
        {/* <Paper withBorder p="lg" radius="lg">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text size="sm" fw={600} c="dimmed">
                Progress
              </Text>
              <Text size="md" fw={700}>
                {Math.round(((active + 1) / 4) * 100)}%
              </Text>
            </Group>
            <Progress
              value={((active + 1) / 4) * 100}
              size="lg"
              radius="xl"
              color="blue"
            />
          </Stack>
        </Paper> */}

        {/* Stepper */}
        <Card shadow="sm" padding="xl" radius="md" withBorder={false}>
          <Stepper active={active} onStepClick={setActive} size="sm">
            <Stepper.Step
              label="Personal Info"
              description="Basic details"
              icon={<IconUser size={18} />}
            >
              <Step1PersonalInfo
                formData={formData}
                updateFormData={updateFormData}
              />
            </Stepper.Step>

            <Stepper.Step
              label="ID Verification"
              description="Upload ID"
              icon={<IconId size={18} />}
            >
              <Step2IDVerification
                formData={formData}
                updateFormData={updateFormData}
              />
            </Stepper.Step>

            <Stepper.Step
              label="Agreements"
              description="Review & consent"
              icon={<IconFileText size={18} />}
            >
              <Step3Consent
                formData={formData}
                updateFormData={updateFormData}
              />
            </Stepper.Step>

            <Stepper.Completed>
              <Step4Review formData={formData} />
            </Stepper.Completed>
          </Stepper>

          {/* Navigation Buttons */}
          {kycStatus !== "PENDING" && (
            <Group justify="flex-end" mt="xl">
              <Button
                variant="default"
                onClick={prevStep}
                disabled={active === 0}
                size="sm"
              >
                Back
              </Button>
              {active < 3 ? (
                <Button onClick={nextStep} size="sm" color="blue">
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  size="sm"
                  color="blue"
                >
                  Submit Verification
                </Button>
              )}
            </Group>
          )}
        </Card>
      </Stack>
    </Container>
  );
}

// Step 1: Personal Information
function Step1PersonalInfo({
  formData,
  updateFormData,
}: {
  formData: KYCFormData;
  updateFormData: (field: keyof KYCFormData, value: any) => void;
}) {
  return (
    <Stack gap="lg" mt="lg">
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
function Step2IDVerification({
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
    <Stack gap="lg" mt="lg">
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
          {
            value: "philpassport",
            label: "Philippine Passport (DFA)",
          },
          {
            value: "philsys",
            label: "Philippine National ID / PhilSys ID (PSA)",
          },
          {
            value: "drivers_license",
            label: "Driver's License (LTO)",
          },
          {
            value: "sss",
            label: "Social Security System (SSS) ID",
          },
          {
            value: "gsis_umid",
            label: "GSIS UMID Card",
          },
          {
            value: "tin",
            label: "Tax Identification Number (TIN) ID (BIR)",
          },
          {
            value: "voters",
            label: "Voter's ID / COMELEC Voter's Identification Card",
          },
          {
            value: "postal",
            label: "Postal ID (Philippine Postal Corporation)",
          },
          {
            value: "ofw",
            label: "OFW ID (DFA)",
          },
          {
            value: "philhealth",
            label: "PhilHealth ID (Philippine Health Insurance Corporation)",
          },
          {
            value: "seamans_book",
            label: "Seaman's Book (POEA)",
          },
          {
            value: "prc",
            label: "PRC ID (Professional Regulation Commission)",
          },
        ]}
        value={formData.idType}
        onChange={(value: string | null) =>
          updateFormData("idType", value || "")
        }
        searchable
        description="Select the type of government-issued ID you will upload"
      />

      <SimpleGrid cols={{base: 1, sm: 2}} spacing="lg">
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
function Step3Consent({
  formData,
  updateFormData,
}: {
  formData: KYCFormData;
  updateFormData: (field: keyof KYCFormData, value: any) => void;
}) {
  return (
    <Stack gap="lg" mt="lg">
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

      <Alert color="yellow" variant="light" radius="md" mt="md">
        <Text size="sm">
          <strong>Important:</strong> By submitting this form, you confirm that
          all information provided is accurate and truthful. Providing false
          information may result in account suspension or termination.
        </Text>
      </Alert>
    </Stack>
  );
}

// Step 4: Review
function Step4Review({formData}: {formData: KYCFormData}) {
  return (
    <Stack gap="lg" mt="lg">
      <Alert variant="light" color="gray" icon={<IconCheck size={16} />}>
        Please review your information before submitting. You can go back to
        make changes.
      </Alert>

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
                {new Date(formData.dateOfBirth).toLocaleDateString()}
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
    </Stack>
  );
}
