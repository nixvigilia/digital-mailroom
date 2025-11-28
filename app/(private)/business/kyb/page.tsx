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
  Textarea,
} from "@mantine/core";
import {
  IconBuilding,
  IconFileText,
  IconCheck,
  IconAlertCircle,
  IconUpload,
  IconId,
} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";
import {useRouter} from "next/navigation";

// Mock KYB status check - will be replaced with API
async function getKYBStatus(): Promise<string> {
  // TODO: Replace with actual API call
  return "NOT_STARTED";
}

interface KYBFormData {
  // Step 1: Business Information
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxIdNumber: string;
  businessAddress: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  email: string;
  website: string;

  // Step 2: Business Documents
  businessRegistrationFile: File | null;
  businessRegistrationFileUrl: string | null;
  taxCertificateFile: File | null;
  taxCertificateFileUrl: string | null;
  businessPermitFile: File | null;
  businessPermitFileUrl: string | null;

  // Step 3: Authorized Representative
  representativeFirstName: string;
  representativeLastName: string;
  representativePosition: string;
  representativeEmail: string;
  representativePhone: string;
  representativeIdType: string;
  representativeIdFileFront: File | null;
  representativeIdFileFrontUrl: string | null;
  representativeIdFileBack: File | null;
  representativeIdFileBackUrl: string | null;

  // Step 4: Consent & Agreement
  consentBusinessVerification: boolean;
  consentDataProcessing: boolean;
  consentTermsOfService: boolean;
  consentPrivacyPolicy: boolean;
}

export default function KYBPage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [kybStatus, setKybStatusState] = useState<string>("NOT_STARTED");

  useEffect(() => {
    const checkStatus = async () => {
      const status = await getKYBStatus();
      setKybStatusState(status);
      if (status === "APPROVED") {
        router.push("/business/inbox");
      } else if (status === "PENDING") {
        setActive(4); // Show review step if pending
      }
    };
    checkStatus();
  }, [router]);

  const [formData, setFormData] = useState<KYBFormData>({
    businessName: "",
    businessType: "",
    registrationNumber: "",
    taxIdNumber: "",
    businessAddress: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Philippines",
    phoneNumber: "",
    email: "",
    website: "",
    businessRegistrationFile: null,
    businessRegistrationFileUrl: null,
    taxCertificateFile: null,
    taxCertificateFileUrl: null,
    businessPermitFile: null,
    businessPermitFileUrl: null,
    representativeFirstName: "",
    representativeLastName: "",
    representativePosition: "",
    representativeEmail: "",
    representativePhone: "",
    representativeIdType: "",
    representativeIdFileFront: null,
    representativeIdFileFrontUrl: null,
    representativeIdFileBack: null,
    representativeIdFileBackUrl: null,
    consentBusinessVerification: false,
    consentDataProcessing: false,
    consentTermsOfService: false,
    consentPrivacyPolicy: false,
  });

  const updateFormData = (field: keyof KYBFormData, value: any) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const nextStep = () => {
    if (active === 0) {
      // Validate Step 1: Business Information
      if (
        !formData.businessName ||
        !formData.businessType ||
        !formData.registrationNumber ||
        !formData.taxIdNumber ||
        !formData.businessAddress ||
        !formData.city ||
        !formData.province ||
        !formData.postalCode ||
        !formData.phoneNumber ||
        !formData.email
      ) {
        notifications.show({
          title: "Validation Error",
          message: "Please fill in all required fields",
          color: "red",
        });
        return;
      }
    } else if (active === 1) {
      // Validate Step 2: Business Documents
      if (
        !formData.businessRegistrationFile ||
        !formData.taxCertificateFile ||
        !formData.businessPermitFile
      ) {
        notifications.show({
          title: "Validation Error",
          message: "Please upload all required documents",
          color: "red",
        });
        return;
      }
    } else if (active === 2) {
      // Validate Step 3: Authorized Representative
      if (
        !formData.representativeFirstName ||
        !formData.representativeLastName ||
        !formData.representativePosition ||
        !formData.representativeEmail ||
        !formData.representativePhone ||
        !formData.representativeIdType ||
        !formData.representativeIdFileFront ||
        !formData.representativeIdFileBack
      ) {
        notifications.show({
          title: "Validation Error",
          message: "Please fill in all required fields and upload ID documents",
          color: "red",
        });
        return;
      }
    } else if (active === 3) {
      // Validate Step 4: Consent
      if (
        !formData.consentBusinessVerification ||
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
    setActive((current) => (current < 4 ? current + 1 : current));
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Implement KYB submission
      notifications.show({
        title: "Success",
        message: "KYB verification submitted successfully",
        color: "green",
      });
      router.push("/business/inbox");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to submit KYB verification",
        color: "red",
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
            <IconBuilding size={40} color="var(--mantine-color-blue-6)" />
          </Box>
          <Title order={1} fw={700} size="clamp(2rem, 5vw, 3rem)">
            Complete Your Business Verification (KYB)
          </Title>
          <Text c="dimmed" size="lg" maw={600}>
            Complete your Business Verification to start receiving mail for your
            organization. This process is required for security and compliance.
          </Text>
          {kybStatus === "PENDING" && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="yellow"
              maw={600}
              style={{width: "100%"}}
            >
              Your KYB verification is pending review. You'll be notified once
              approved.
            </Alert>
          )}
          {kybStatus === "REJECTED" && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              maw={600}
              style={{width: "100%"}}
            >
              Your KYB verification was rejected. Please review and resubmit your
              information.
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
                {Math.round(((active + 1) / 5) * 100)}%
              </Text>
            </Group>
            <Progress
              value={((active + 1) / 5) * 100}
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
              label="Business Information"
              description="Company details"
              icon={<IconBuilding size={20} />}
            >
              <Stack gap="md" mt="xl">
                <TextInput
                  label="Business Name"
                  placeholder="Enter your business name"
                  required
                  value={formData.businessName}
                  onChange={(e) => updateFormData("businessName", e.target.value)}
                />
                <Select
                  label="Business Type"
                  placeholder="Select business type"
                  required
                  data={[
                    "Corporation",
                    "Partnership",
                    "Sole Proprietorship",
                    "LLC",
                    "Other",
                  ]}
                  value={formData.businessType}
                  onChange={(value) => updateFormData("businessType", value || "")}
                />
                <TextInput
                  label="Registration Number (SEC/DTI)"
                  placeholder="Enter registration number"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => updateFormData("registrationNumber", e.target.value)}
                />
                <TextInput
                  label="Tax ID Number (TIN)"
                  placeholder="Enter TIN"
                  required
                  value={formData.taxIdNumber}
                  onChange={(e) => updateFormData("taxIdNumber", e.target.value)}
                />
                <Textarea
                  label="Business Address"
                  placeholder="Enter complete business address"
                  required
                  minRows={2}
                  value={formData.businessAddress}
                  onChange={(e) => updateFormData("businessAddress", e.target.value)}
                />
                <Group grow>
                  <TextInput
                    label="City"
                    placeholder="Enter city"
                    required
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                  />
                  <TextInput
                    label="Province"
                    placeholder="Enter province"
                    required
                    value={formData.province}
                    onChange={(e) => updateFormData("province", e.target.value)}
                  />
                  <TextInput
                    label="Postal Code"
                    placeholder="Enter postal code"
                    required
                    value={formData.postalCode}
                    onChange={(e) => updateFormData("postalCode", e.target.value)}
                  />
                </Group>
                <Group grow>
                  <TextInput
                    label="Phone Number"
                    placeholder="Enter business phone"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                  />
                  <TextInput
                    label="Email"
                    placeholder="Enter business email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                  />
                </Group>
                <TextInput
                  label="Website (Optional)"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => updateFormData("website", e.target.value)}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step
              label="Business Documents"
              description="Upload required documents"
              icon={<IconFileText size={20} />}
            >
              <Stack gap="md" mt="xl">
                <Text size="sm" c="dimmed">
                  Please upload the following documents for business verification:
                </Text>
                <Divider />
                <FileButton
                  onChange={(file) => {
                    if (file) {
                      updateFormData("businessRegistrationFile", file);
                      updateFormData(
                        "businessRegistrationFileUrl",
                        URL.createObjectURL(file)
                      );
                    }
                  }}
                  accept="image/*,application/pdf"
                >
                  {(props) => (
                    <Button {...props} leftSection={<IconUpload size={18} />} variant="outline">
                      {formData.businessRegistrationFile
                        ? formData.businessRegistrationFile.name
                        : "Upload Business Registration (SEC/DTI)"}
                    </Button>
                  )}
                </FileButton>
                <FileButton
                  onChange={(file) => {
                    if (file) {
                      updateFormData("taxCertificateFile", file);
                      updateFormData("taxCertificateFileUrl", URL.createObjectURL(file));
                    }
                  }}
                  accept="image/*,application/pdf"
                >
                  {(props) => (
                    <Button {...props} leftSection={<IconUpload size={18} />} variant="outline">
                      {formData.taxCertificateFile
                        ? formData.taxCertificateFile.name
                        : "Upload Tax Certificate (BIR)"}
                    </Button>
                  )}
                </FileButton>
                <FileButton
                  onChange={(file) => {
                    if (file) {
                      updateFormData("businessPermitFile", file);
                      updateFormData("businessPermitFileUrl", URL.createObjectURL(file));
                    }
                  }}
                  accept="image/*,application/pdf"
                >
                  {(props) => (
                    <Button {...props} leftSection={<IconUpload size={18} />} variant="outline">
                      {formData.businessPermitFile
                        ? formData.businessPermitFile.name
                        : "Upload Business Permit"}
                    </Button>
                  )}
                </FileButton>
              </Stack>
            </Stepper.Step>

            <Stepper.Step
              label="Authorized Representative"
              description="Person authorized to manage account"
              icon={<IconId size={20} />}
            >
              <Stack gap="md" mt="xl">
                <Text size="sm" c="dimmed">
                  Provide information about the authorized representative who will manage
                  this business account.
                </Text>
                <Divider />
                <Group grow>
                  <TextInput
                    label="First Name"
                    placeholder="Enter first name"
                    required
                    value={formData.representativeFirstName}
                    onChange={(e) =>
                      updateFormData("representativeFirstName", e.target.value)
                    }
                  />
                  <TextInput
                    label="Last Name"
                    placeholder="Enter last name"
                    required
                    value={formData.representativeLastName}
                    onChange={(e) =>
                      updateFormData("representativeLastName", e.target.value)
                    }
                  />
                </Group>
                <TextInput
                  label="Position/Title"
                  placeholder="e.g., CEO, Managing Director"
                  required
                  value={formData.representativePosition}
                  onChange={(e) => updateFormData("representativePosition", e.target.value)}
                />
                <Group grow>
                  <TextInput
                    label="Email"
                    placeholder="Enter email"
                    required
                    type="email"
                    value={formData.representativeEmail}
                    onChange={(e) => updateFormData("representativeEmail", e.target.value)}
                  />
                  <TextInput
                    label="Phone Number"
                    placeholder="Enter phone number"
                    required
                    value={formData.representativePhone}
                    onChange={(e) => updateFormData("representativePhone", e.target.value)}
                  />
                </Group>
                <Select
                  label="ID Type"
                  placeholder="Select ID type"
                  required
                  data={["Philippine Passport", "Driver's License", "National ID", "SSS ID", "TIN ID"]}
                  value={formData.representativeIdType}
                  onChange={(value) => updateFormData("representativeIdType", value || "")}
                />
                <Group grow>
                  <FileButton
                    onChange={(file) => {
                      if (file) {
                        updateFormData("representativeIdFileFront", file);
                        updateFormData(
                          "representativeIdFileFrontUrl",
                          URL.createObjectURL(file)
                        );
                      }
                    }}
                    accept="image/*,application/pdf"
                  >
                    {(props) => (
                      <Button {...props} leftSection={<IconUpload size={18} />} variant="outline">
                        {formData.representativeIdFileFront
                          ? formData.representativeIdFileFront.name
                          : "Upload ID Front"}
                      </Button>
                    )}
                  </FileButton>
                  <FileButton
                    onChange={(file) => {
                      if (file) {
                        updateFormData("representativeIdFileBack", file);
                        updateFormData(
                          "representativeIdFileBackUrl",
                          URL.createObjectURL(file)
                        );
                      }
                    }}
                    accept="image/*,application/pdf"
                  >
                    {(props) => (
                      <Button {...props} leftSection={<IconUpload size={18} />} variant="outline">
                        {formData.representativeIdFileBack
                          ? formData.representativeIdFileBack.name
                          : "Upload ID Back"}
                      </Button>
                    )}
                  </FileButton>
                </Group>
              </Stack>
            </Stepper.Step>

            <Stepper.Step
              label="Consent & Agreement"
              description="Review and accept"
              icon={<IconFileText size={20} />}
            >
              <Stack gap="md" mt="xl">
                <Text size="sm" c="dimmed">
                  Please review and accept the following agreements:
                </Text>
                <Divider />
                <Checkbox
                  label={
                    <>
                      I consent to business verification and authorize the system to verify
                      my business information
                    </>
                  }
                  checked={formData.consentBusinessVerification}
                  onChange={(e) =>
                    updateFormData("consentBusinessVerification", e.target.checked)
                  }
                />
                <Checkbox
                  label={
                    <>
                      I consent to data processing and storage of my business information
                    </>
                  }
                  checked={formData.consentDataProcessing}
                  onChange={(e) =>
                    updateFormData("consentDataProcessing", e.target.checked)
                  }
                />
                <Checkbox
                  label={
                    <>
                      I agree to the{" "}
                      <Anchor href="/terms" target="_blank">
                        Terms of Service
                      </Anchor>
                    </>
                  }
                  checked={formData.consentTermsOfService}
                  onChange={(e) =>
                    updateFormData("consentTermsOfService", e.target.checked)
                  }
                />
                <Checkbox
                  label={
                    <>
                      I agree to the{" "}
                      <Anchor href="/privacy" target="_blank">
                        Privacy Policy
                      </Anchor>
                    </>
                  }
                  checked={formData.consentPrivacyPolicy}
                  onChange={(e) =>
                    updateFormData("consentPrivacyPolicy", e.target.checked)
                  }
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Completed>
              <Stack gap="md" mt="xl">
                <Alert icon={<IconCheck size={16} />} color="green">
                  Please review your information before submitting.
                </Alert>
                <Paper withBorder p="md" radius="md">
                  <Stack gap="sm">
                    <Text fw={600}>Business Information</Text>
                    <Text size="sm">
                      <strong>Name:</strong> {formData.businessName}
                    </Text>
                    <Text size="sm">
                      <strong>Type:</strong> {formData.businessType}
                    </Text>
                    <Text size="sm">
                      <strong>Registration:</strong> {formData.registrationNumber}
                    </Text>
                    <Text size="sm">
                      <strong>TIN:</strong> {formData.taxIdNumber}
                    </Text>
                  </Stack>
                </Paper>
                <Paper withBorder p="md" radius="md">
                  <Stack gap="sm">
                    <Text fw={600}>Authorized Representative</Text>
                    <Text size="sm">
                      <strong>Name:</strong> {formData.representativeFirstName}{" "}
                      {formData.representativeLastName}
                    </Text>
                    <Text size="sm">
                      <strong>Position:</strong> {formData.representativePosition}
                    </Text>
                    <Text size="sm">
                      <strong>Email:</strong> {formData.representativeEmail}
                    </Text>
                  </Stack>
                </Paper>
              </Stack>
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
          {active < 4 ? (
            <Button onClick={nextStep} size="md" color="blue">
              Next step
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading} size="md" color="blue">
              Submit for Verification
            </Button>
          )}
        </Group>
      </Stack>
    </Container>
  );
}

