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
async function getKYCStatus(): Promise<string> {
  try {
    const response = await fetch("/api/kyc/status", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return "NOT_STARTED";
    }

    const data = await response.json();
    return data.status || "NOT_STARTED";
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return "NOT_STARTED";
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

  useEffect(() => {
    const checkStatus = async () => {
      const status = await getKYCStatus();
      setKycStatusState(status);
      if (status === "APPROVED") {
        router.push("/app/dashboard");
      } else if (status === "PENDING") {
        setActive(3); // Show review step if pending
      }
    };
    checkStatus();
  }, [router]);
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
      // TODO: Upload files to Supabase Storage and get URLs
      // For now, using blob URLs as placeholders
      const result = await submitKYC({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: formData.country,
        idType: formData.idType,
        idFileFrontUrl: formData.idFileFrontUrl,
        idFileBackUrl: formData.idFileBackUrl,
        consentMailOpening: formData.consentMailOpening,
        consentDataProcessing: formData.consentDataProcessing,
        consentTermsOfService: formData.consentTermsOfService,
        consentPrivacyPolicy: formData.consentPrivacyPolicy,
      });

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
          router.push("/app/dashboard");
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
    <Container size="md" py="xl">
      <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
        {/* Header */}
        <Stack gap="md" align="center" ta="center">
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: "var(--mantine-radius-lg)",
              backgroundColor: "var(--mantine-color-blue-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--mantine-shadow-sm)",
            }}
          >
            <IconId size={40} color="var(--mantine-color-blue-6)" />
          </Box>
          <Title order={1} fw={700} size="clamp(2rem, 5vw, 3rem)">
            Complete Your KYC Verification
          </Title>
          <Text c="dimmed" size="lg" maw={600}>
            Complete your Identity Verification to start receiving mail. This
            process is required for security and compliance.
          </Text>
          {kycStatus === "PENDING" && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="yellow"
              maw={600}
              style={{width: "100%"}}
            >
              Your KYC verification is pending review. You'll be notified once
              approved.
            </Alert>
          )}
          {kycStatus === "REJECTED" && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              maw={600}
              style={{width: "100%"}}
            >
              Your KYC verification was rejected. Please review and resubmit
              your information.
            </Alert>
          )}
        </Stack>

        {/* Progress Indicator */}
        <Paper withBorder p="lg" radius="lg">
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
        </Paper>

        {/* Stepper */}
        <Paper withBorder p="xl" radius="lg">
          <Stepper active={active} onStepClick={setActive} size="md">
            <Stepper.Step
              label="Personal Information"
              description="Your basic details"
              icon={<IconUser size={20} />}
            >
              <Step1PersonalInfo
                formData={formData}
                updateFormData={updateFormData}
              />
            </Stepper.Step>

            <Stepper.Step
              label="ID Verification"
              description="Upload identification"
              icon={<IconId size={20} />}
            >
              <Step2IDVerification
                formData={formData}
                updateFormData={updateFormData}
              />
            </Stepper.Step>

            <Stepper.Step
              label="Consent & Agreement"
              description="Review and accept"
              icon={<IconFileText size={20} />}
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
        </Paper>

        {/* Navigation Buttons */}
        <Group justify="space-between" mt="xl">
          <Button
            variant="default"
            onClick={prevStep}
            disabled={active === 0}
            size="md"
          >
            Previous
          </Button>
          {active < 3 ? (
            <Button onClick={nextStep} size="md" color="blue">
              Next step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              size="md"
              color="blue"
            >
              Submit for Verification
            </Button>
          )}
        </Group>
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
    <Stack gap="xl" mt="xl">
      <Alert icon={<IconAlertCircle size={16} />} color="blue" radius="md">
        Please provide your accurate personal information. This will be used for
        mail delivery and account verification.
      </Alert>

      <Paper withBorder p="xl" radius="lg">
        <Stack gap="lg">
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
      </Paper>
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
    <Stack gap="xl" mt="xl">
      <Alert icon={<IconAlertCircle size={16} />} color="blue" radius="md">
        Upload a clear photo or scan of a government-issued ID. Please select
        your ID type from the list below.
      </Alert>

      <Paper withBorder p="xl" radius="lg">
        <Stack gap="lg">
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
                label:
                  "PhilHealth ID (Philippine Health Insurance Corporation)",
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

          <Stack gap="md">
            {/* Front of ID */}
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Upload ID Document - Front
              </Text>
              <Text size="xs" c="dimmed" mb="md">
                Upload a clear photo or scan of the front side (JPEG, PNG, or
                PDF, max 5MB)
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
                      leftSection={<IconUpload size={18} />}
                      loading={uploading}
                      variant={formData.idFileFront ? "light" : "filled"}
                    >
                      {formData.idFileFront
                        ? formData.idFileFront.name
                        : "Choose Front File"}
                    </Button>
                  )}
                </FileButton>
                {formData.idFileFront && (
                  <Button
                    variant="subtle"
                    color="red"
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
                    <Text size="sm" fw={500} mb="xs">
                      Front Preview:
                    </Text>
                    <Box
                      style={{
                        border: "1px solid var(--mantine-color-gray-3)",
                        borderRadius: "var(--mantine-radius-md)",
                        overflow: "hidden",
                        maxWidth: 400,
                      }}
                    >
                      <img
                        src={formData.idFileFrontUrl}
                        alt="ID Front Preview"
                        style={{
                          width: "100%",
                          height: "auto",
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
                Upload ID Document - Back
              </Text>
              <Text size="xs" c="dimmed" mb="md">
                Upload a clear photo or scan of the back side (JPEG, PNG, or
                PDF, max 5MB)
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
                      leftSection={<IconUpload size={18} />}
                      loading={uploading}
                      variant={formData.idFileBack ? "light" : "filled"}
                    >
                      {formData.idFileBack
                        ? formData.idFileBack.name
                        : "Choose Back File"}
                    </Button>
                  )}
                </FileButton>
                {formData.idFileBack && (
                  <Button
                    variant="subtle"
                    color="red"
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
                    <Text size="sm" fw={500} mb="xs">
                      Back Preview:
                    </Text>
                    <Box
                      style={{
                        border: "1px solid var(--mantine-color-gray-3)",
                        borderRadius: "var(--mantine-radius-md)",
                        overflow: "hidden",
                        maxWidth: 400,
                      }}
                    >
                      <img
                        src={formData.idFileBackUrl}
                        alt="ID Back Preview"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </Box>
                  </Box>
                )}
            </Box>
          </Stack>
        </Stack>
      </Paper>
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
    <Stack gap="xl" mt="xl">
      <Alert icon={<IconAlertCircle size={16} />} color="blue" radius="md">
        Please read and accept all consents to proceed with your verification.
      </Alert>

      <Paper withBorder p="xl" radius="lg">
        <Stack gap="lg">
          <Divider label="Required Consents" labelPosition="center" />

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

          <Divider />

          <Alert color="yellow" radius="md">
            <Text size="sm">
              <strong>Important:</strong> By submitting this form, you confirm
              that all information provided is accurate and truthful. Providing
              false information may result in account suspension or termination.
            </Text>
          </Alert>
        </Stack>
      </Paper>
    </Stack>
  );
}

// Step 4: Review
function Step4Review({formData}: {formData: KYCFormData}) {
  return (
    <Stack gap="xl" mt="xl">
      <Paper withBorder p="xl" radius="lg">
        <Stack gap="lg">
          <Title order={3} size="h4" fw={700}>
            Review Your Information
          </Title>
          <Text c="dimmed" size="md">
            Please review your information before submitting. You can go back to
            make changes.
          </Text>

          <Divider />

          <Stack gap="md">
            <Box>
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                Personal Information
              </Text>
              <Text size="sm">
                <strong>Name:</strong> {formData.firstName} {formData.lastName}
              </Text>
              <Text size="sm">
                <strong>Date of Birth:</strong>{" "}
                {new Date(formData.dateOfBirth).toLocaleDateString()}
              </Text>
              <Text size="sm">
                <strong>Phone:</strong> {formData.phoneNumber}
              </Text>
              <Text size="sm">
                <strong>Address:</strong> {formData.address}, {formData.city},{" "}
                {formData.province} {formData.postalCode}
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                ID Verification
              </Text>
              <Text size="sm">
                <strong>ID Type:</strong>{" "}
                {formData.idType
                  ? [
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
                        label:
                          "Voter's ID / COMELEC Voter's Identification Card",
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
                        label:
                          "PhilHealth ID (Philippine Health Insurance Corporation)",
                      },
                      {
                        value: "seamans_book",
                        label: "Seaman's Book (POEA)",
                      },
                      {
                        value: "prc",
                        label: "PRC ID (Professional Regulation Commission)",
                      },
                    ].find((id) => id.value === formData.idType)?.label ||
                    formData.idType
                  : "Not selected"}
              </Text>
              <Text size="sm">
                <strong>Front Document:</strong>{" "}
                {formData.idFileFront
                  ? formData.idFileFront.name
                  : "Not uploaded"}
              </Text>
              <Text size="sm">
                <strong>Back Document:</strong>{" "}
                {formData.idFileBack
                  ? formData.idFileBack.name
                  : "Not uploaded"}
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                Consents
              </Text>
              <Stack gap="xs">
                <Text size="sm">
                  {formData.consentMailOpening ? "✓" : "✗"} Mail Opening Consent
                </Text>
                <Text size="sm">
                  {formData.consentDataProcessing ? "✓" : "✗"} Data Processing
                  Consent
                </Text>
                <Text size="sm">
                  {formData.consentTermsOfService ? "✓" : "✗"} Terms of Service
                </Text>
                <Text size="sm">
                  {formData.consentPrivacyPolicy ? "✓" : "✗"} Privacy Policy
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
