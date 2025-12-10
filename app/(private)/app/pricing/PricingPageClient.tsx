"use client";

import {useState, use} from "react";
import {notifications} from "@mantine/notifications";
import {createSubscriptionInvoice} from "@/app/actions/payment";
import {saveBasicInfo} from "@/app/actions/kyc";
import {
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  Badge,
  SimpleGrid,
  ThemeIcon,
  Divider,
  Select,
  Stepper,
  Container,
  Card,
  Box,
  Alert,
  TextInput,
} from "@mantine/core";
import {
  IconCheck,
  IconCrown,
  IconCreditCard,
  IconBuilding,
  IconRocket,
  IconMapPin,
  IconUserCheck,
  IconFileText,
  IconCalendar,
  IconDatabase,
  IconUsers,
  IconBox,
  IconX,
} from "@tabler/icons-react";
import {Package} from "@/app/generated/prisma/client";

interface PricingPageClientProps {
  currentPlanType: string;
  packagesPromise: Promise<Package[]>;
  locationsPromise: Promise<any>;
}

export function PricingPageClient({
  currentPlanType,
  packagesPromise,
  locationsPromise,
}: PricingPageClientProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [billingCycle, setBillingCycle] = useState<
    "MONTHLY" | "QUARTERLY" | "YEARLY"
  >("MONTHLY");

  // Selection State
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Basic Info State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const data = use(packagesPromise);
  const locationsData = use(locationsPromise);
  const locations = locationsData.success ? locationsData.data : [];

  // Filter out FREE plan and sort by display_order
  const packages = data
    .filter((pkg) => pkg.plan_type !== "FREE")
    .sort((a, b) => a.display_order - b.display_order);

  const getPrice = (pkg: Package) => {
    switch (billingCycle) {
      case "QUARTERLY":
        return Number(pkg.price_quarterly) || Number(pkg.price_monthly) * 3;
      case "YEARLY":
        return Number(pkg.price_yearly) || Number(pkg.price_monthly) * 12;
      default:
        return Number(pkg.price_monthly);
    }
  };

  const getPeriod = () => {
    switch (billingCycle) {
      case "QUARTERLY":
        return "/quarter";
      case "YEARLY":
        return "/year";
      default:
        return "/month";
    }
  };

  const handleSelectPlan = (planType: string) => {
    setSelectedPlanType(planType);
    setActiveStep(1); // Move to Location Step
  };

  const handleSelectLocation = (locationId: string | null) => {
    setSelectedLocation(locationId);
  };

  const confirmLocation = () => {
    if (!selectedLocation) {
      notifications.show({
        title: "Location Required",
        message: "Please select a mailing location to proceed",
        color: "orange",
      });
      return;
    }
    setActiveStep(2); // Move to KYC Step
  };

  const validateBasicInfo = () => {
    if (!firstName || !lastName || !phoneNumber) {
      notifications.show({
        title: "Validation Error",
        message: "Please complete all required fields (name and phone)",
        color: "red",
      });
      return false;
    }
    return true;
  };

  const handleProcessSubscription = async () => {
    if (!selectedPlanType || !selectedLocation) return;
    if (!validateBasicInfo()) return;

    setLoading(true);

    try {
      // 1. Save Basic Information
      const basicInfoResult = await saveBasicInfo(
        firstName,
        lastName,
        phoneNumber
      );

      if (!basicInfoResult.success) {
        notifications.show({
          title: "Save Failed",
          message: basicInfoResult.message,
          color: "red",
        });
        setLoading(false);
        return;
      }

      // 2. Create Subscription Invoice
      const invoiceResult = await createSubscriptionInvoice(
        selectedPlanType,
        billingCycle,
        selectedLocation
      );

      if (invoiceResult.success) {
        notifications.show({
          title: "Success",
          message: "Redirecting to payment...",
          color: "green",
        });
        window.location.href = invoiceResult.invoiceUrl;
      } else {
        notifications.show({
          title: "Subscription Error",
          message: invoiceResult.message,
          color: "red",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Process error:", error);
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred",
        color: "red",
      });
      setLoading(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs" align="center" ta="center">
          <Title order={1} fw={800} size="clamp(2rem, 5vw, 3rem)">
            Subscribe to KEEP
          </Title>
          <Text c="dimmed" size="lg">
            Complete the steps below to activate your account
          </Text>
        </Stack>

        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          allowNextStepsSelect={false}
        >
          <Stepper.Step
            label="Choose Plan"
            description="Select a subscription"
            icon={<IconCrown size={18} />}
          >
            {/* Billing Cycle Selector */}
            <Paper
              withBorder
              p="md"
              radius="md"
              style={{maxWidth: 400, margin: "2rem auto"}}
              mb="xl"
            >
              <Group justify="center" gap="md">
                <Text size="sm" fw={500}>
                  Billing Cycle:
                </Text>
                <Select
                  value={billingCycle}
                  onChange={(value) =>
                    setBillingCycle(
                      (value as "MONTHLY" | "QUARTERLY" | "YEARLY") || "MONTHLY"
                    )
                  }
                  data={[
                    {value: "MONTHLY", label: "Monthly"},
                    {value: "QUARTERLY", label: "Quarterly"},
                    {value: "YEARLY", label: "Yearly"},
                  ]}
                  style={{minWidth: 150}}
                />
              </Group>
            </Paper>

            <SimpleGrid
              cols={{base: 1, sm: 2, lg: 3}}
              spacing={{base: "md", md: "xl"}}
            >
              {packages.map((pkg) => {
                const price = getPrice(pkg);
                const isFeatured = pkg.is_featured;
                return (
                  <Paper
                    key={pkg.id}
                    withBorder
                    p="xl"
                    radius="md"
                    style={{
                      position: "relative",
                      border: isFeatured
                        ? "2px solid var(--mantine-color-blue-6)"
                        : undefined,
                      transform: isFeatured ? "scale(1.05)" : undefined,
                      transition: "transform 0.2s",
                    }}
                  >
                    {isFeatured && (
                      <Badge
                        color="blue"
                        variant="filled"
                        size="lg"
                        style={{
                          position: "absolute",
                          top: -12,
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        Most Popular
                      </Badge>
                    )}
                    <Stack gap="md">
                      <Stack gap="xs" align="center" ta="center">
                        <ThemeIcon
                          size={60}
                          radius="xl"
                          variant="light"
                          color={isFeatured ? "blue" : "gray"}
                        >
                          {pkg.plan_type === "BUSINESS" ? (
                            <IconBuilding size={30} />
                          ) : (
                            <IconCrown size={30} />
                          )}
                        </ThemeIcon>
                        <Title order={2} size="h3" fw={700}>
                          {pkg.name}
                        </Title>
                        {pkg.description && (
                          <Text size="sm" c="dimmed" ta="center">
                            {pkg.description}
                          </Text>
                        )}
                      </Stack>
                      <Divider />
                      <Stack gap={4} align="center">
                        <Group gap={4} align="flex-end" justify="center">
                          <Title order={2} size="2.5rem" fw={800}>
                            ₱{price.toLocaleString()}
                          </Title>
                          <Text size="sm" c="dimmed" mb={8}>
                            {getPeriod()}
                          </Text>
                        </Group>
                      </Stack>
                      <Divider />
                      {/* Major Package Features */}
                      <Stack gap="xs">
                        {pkg.max_scanned_pages !== null && (
                          <Group gap="xs" align="center">
                            <ThemeIcon
                              color="blue"
                              variant="light"
                              size="sm"
                              radius="xl"
                            >
                              <IconFileText size={16} />
                            </ThemeIcon>
                            <Text size="sm" style={{flex: 1}}>
                              <Text span fw={600}>
                                {pkg.max_scanned_pages === -1
                                  ? "Unlimited"
                                  : pkg.max_scanned_pages.toLocaleString()}{" "}
                              </Text>
                              scanned pages
                              {pkg.max_scanned_pages !== -1 && " per month"}
                            </Text>
                          </Group>
                        )}
                        {pkg.retention_days !== null && (
                          <Group gap="xs" align="center">
                            <ThemeIcon
                              color="blue"
                              variant="light"
                              size="sm"
                              radius="xl"
                            >
                              <IconCalendar size={16} />
                            </ThemeIcon>
                            <Text size="sm" style={{flex: 1}}>
                              <Text span fw={600}>
                                {pkg.retention_days === -1
                                  ? "Unlimited"
                                  : pkg.retention_days}{" "}
                              </Text>
                              days mail retention
                            </Text>
                          </Group>
                        )}
                        {pkg.max_storage_items !== null && (
                          <Group gap="xs" align="center">
                            <ThemeIcon
                              color="blue"
                              variant="light"
                              size="sm"
                              radius="xl"
                            >
                              <IconBox size={16} />
                            </ThemeIcon>
                            <Text size="sm" style={{flex: 1}}>
                              <Text span fw={600}>
                                {pkg.max_storage_items === -1
                                  ? "Unlimited"
                                  : pkg.max_storage_items.toLocaleString()}{" "}
                              </Text>
                              storage items
                            </Text>
                          </Group>
                        )}
                        {pkg.digital_storage_mb !== null && (
                          <Group gap="xs" align="center">
                            <ThemeIcon
                              color="blue"
                              variant="light"
                              size="sm"
                              radius="xl"
                            >
                              <IconDatabase size={16} />
                            </ThemeIcon>
                            <Text size="sm" style={{flex: 1}}>
                              <Text span fw={600}>
                                {pkg.digital_storage_mb === -1
                                  ? "Unlimited"
                                  : pkg.digital_storage_mb >= 1024
                                  ? `${(pkg.digital_storage_mb / 1024).toFixed(
                                      1
                                    )} GB`
                                  : `${pkg.digital_storage_mb} MB`}{" "}
                              </Text>
                              digital storage
                            </Text>
                          </Group>
                        )}
                        {pkg.max_team_members !== null &&
                          pkg.max_team_members > 0 && (
                            <Group gap="xs" align="center">
                              <ThemeIcon
                                color="blue"
                                variant="light"
                                size="sm"
                                radius="xl"
                              >
                                <IconUsers size={16} />
                              </ThemeIcon>
                              <Text size="sm" style={{flex: 1}}>
                                <Text span fw={600}>
                                  {pkg.max_team_members === -1
                                    ? "Unlimited"
                                    : pkg.max_team_members}{" "}
                                </Text>
                                team members
                              </Text>
                            </Group>
                          )}
                      </Stack>
                      {pkg.features && pkg.features.length > 0 && (
                        <>
                          <Divider label="Features" labelPosition="center" />
                          <Stack gap="sm">
                            {pkg.features.map(
                              (feature: string, index: number) => (
                                <Group key={index} gap="sm" align="flex-start">
                                  <ThemeIcon
                                    color="green"
                                    variant="transparent"
                                    size="sm"
                                    mt={2}
                                  >
                                    <IconCheck size={16} />
                                  </ThemeIcon>
                                  <Text size="sm" style={{flex: 1}}>
                                    {feature}
                                  </Text>
                                </Group>
                              )
                            )}
                          </Stack>
                        </>
                      )}
                      {pkg.not_included && pkg.not_included.length > 0 && (
                        <>
                          <Divider
                            label="Not Included"
                            labelPosition="center"
                          />
                          <Stack gap="sm">
                            {pkg.not_included.map(
                              (feature: string, index: number) => (
                                <Group key={index} gap="sm" align="flex-start">
                                  <ThemeIcon
                                    color="gray"
                                    variant="light"
                                    size="sm"
                                    mt={2}
                                  >
                                    <IconX size={16} />
                                  </ThemeIcon>
                                  <Text size="sm" c="dimmed" style={{flex: 1}}>
                                    {feature}
                                  </Text>
                                </Group>
                              )
                            )}
                          </Stack>
                        </>
                      )}
                      <Button
                        fullWidth
                        size="lg"
                        variant={isFeatured ? "filled" : "outline"}
                        color="blue"
                        onClick={() => handleSelectPlan(pkg.plan_type)}
                        mt="auto"
                      >
                        Select {pkg.name}
                      </Button>
                    </Stack>
                  </Paper>
                );
              })}
            </SimpleGrid>
          </Stepper.Step>

          <Stepper.Step
            label="Location"
            description="Select address"
            icon={<IconMapPin size={18} />}
          >
            <Container size="sm" mt="xl">
              <Stack gap="xl">
                <Title order={3} ta="center">
                  Select Your Mailing Location
                </Title>
                <Text c="dimmed" ta="center">
                  This will be your new virtual address.
                </Text>

                <SimpleGrid cols={{base: 1, sm: 2}}>
                  {locations.map((loc: any) => (
                    <Card
                      key={loc.id}
                      withBorder
                      padding="lg"
                      radius="md"
                      style={{
                        cursor: "pointer",
                        borderColor:
                          selectedLocation === loc.id
                            ? "var(--mantine-color-blue-6)"
                            : undefined,
                        backgroundColor:
                          selectedLocation === loc.id
                            ? "var(--mantine-color-blue-0)"
                            : undefined,
                      }}
                      onClick={() => handleSelectLocation(loc.id)}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text fw={600}>{loc.name}</Text>
                          {selectedLocation === loc.id && (
                            <ThemeIcon
                              color="blue"
                              variant="light"
                              size="sm"
                              radius="xl"
                            >
                              <IconCheck size={12} />
                            </ThemeIcon>
                          )}
                        </Group>
                        <Text size="sm" c="dimmed">
                          {loc.address}, {loc.city}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {loc.province}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>

                <Group justify="center" mt="xl">
                  <Button variant="default" onClick={() => setActiveStep(0)}>
                    Back
                  </Button>
                  <Button
                    onClick={confirmLocation}
                    disabled={!selectedLocation}
                  >
                    Next: Verification
                  </Button>
                </Group>
              </Stack>
            </Container>
          </Stepper.Step>

          <Stepper.Step
            label="Basic Information"
            description="Payment Details"
            icon={<IconUserCheck size={18} />}
          >
            <Container size="md" mt="xl">
              <Stack gap="xl">
                <Stack gap="xs" mb="lg">
                  <Title order={3}>Basic Information</Title>
                  <Text c="dimmed">
                    Please provide your name and phone number for payment
                    processing.
                  </Text>
                </Stack>

                <Stack gap="lg">
                  <Group grow>
                    <TextInput
                      label="First Name"
                      placeholder="John"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <TextInput
                      label="Last Name"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </Group>

                  <TextInput
                    label="Phone Number"
                    placeholder="+63 912 345 6789"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </Stack>

                <Group justify="flex-end" mt="xl">
                  <Button variant="default" onClick={() => setActiveStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (validateBasicInfo()) setActiveStep(3);
                    }}
                  >
                    Next: Review & Pay
                  </Button>
                </Group>
              </Stack>
            </Container>
          </Stepper.Step>

          <Stepper.Completed>
            <Container size="md" mt="xl">
              <Stack gap="xl">
                <Alert
                  color="blue"
                  title="Review Summary"
                  icon={<IconCheck size={16} />}
                >
                  Please review your subscription details and verification
                  information before proceeding to payment.
                </Alert>

                <SimpleGrid cols={{base: 1, sm: 2}}>
                  <Card withBorder padding="md">
                    <Title order={5} mb="md">
                      Subscription Details
                    </Title>
                    <Text size="sm">
                      <Text span c="dimmed">
                        Plan:
                      </Text>{" "}
                      {
                        packages.find((p) => p.plan_type === selectedPlanType)
                          ?.name
                      }
                    </Text>
                    <Text size="sm">
                      <Text span c="dimmed">
                        Billing:
                      </Text>{" "}
                      {billingCycle}
                    </Text>
                    <Text size="sm">
                      <Text span c="dimmed">
                        Location:
                      </Text>{" "}
                      {
                        locations.find((l: any) => l.id === selectedLocation)
                          ?.name
                      }
                    </Text>
                  </Card>
                  <Card withBorder padding="md">
                    <Title order={5} mb="md">
                      Payment
                    </Title>
                    <Text size="xl" fw={700}>
                      ₱
                      {selectedPlanType &&
                      packages.find((p) => p.plan_type === selectedPlanType)
                        ? getPrice(
                            packages.find(
                              (p) => p.plan_type === selectedPlanType
                            )!
                          ).toLocaleString()
                        : 0}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Due Now
                    </Text>
                  </Card>
                </SimpleGrid>

                <Card withBorder padding="md">
                  <Title order={5} mb="md">
                    Basic Information
                  </Title>
                  <Stack gap="xs">
                    <Text size="sm">
                      <Text span c="dimmed">
                        Name:
                      </Text>{" "}
                      {firstName} {lastName}
                    </Text>
                    <Text size="sm">
                      <Text span c="dimmed">
                        Phone:
                      </Text>{" "}
                      {phoneNumber}
                    </Text>
                  </Stack>
                </Card>

                <Group justify="flex-end" mt="xl">
                  <Button
                    variant="default"
                    onClick={() => setActiveStep(2)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleProcessSubscription}
                    loading={loading}
                    color="blue"
                    size="lg"
                  >
                    Proceed to Payment
                  </Button>
                </Group>
              </Stack>
            </Container>
          </Stepper.Completed>
        </Stepper>
      </Stack>
    </Container>
  );
}
