"use client";

import {useState, use} from "react";
import {notifications} from "@mantine/notifications";
import {createSubscriptionInvoice} from "@/app/actions/payment";
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
} from "@mantine/core";
import {
  IconCheck,
  IconCrown,
  IconCreditCard,
  IconBuilding,
  IconRocket,
} from "@tabler/icons-react";

interface PricingPageClientProps {
  currentPlanType: string;
  packagesPromise: Promise<Package[]>;
  locationsPromise: Promise<any>;
}

// ... existing code ...

export function PricingPageClient({
  currentPlanType,
  packagesPromise,
  locationsPromise,
}: PricingPageClientProps) {
  const [billingCycle, setBillingCycle] = useState<
    "MONTHLY" | "QUARTERLY" | "YEARLY"
  >("MONTHLY");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const data = use(packagesPromise);
  const locationsData = use(locationsPromise);
  const locations = locationsData.success ? locationsData.data : [];

  // Filter out FREE plan and sort by display_order
  const packages = data
    .filter((pkg) => pkg.plan_type !== "FREE")
    .sort((a, b) => a.display_order - b.display_order);

  // ... existing code ...

  const handleSelectPlan = async (planType: string) => {
    if (!selectedLocation && planType !== "FREE") {
      notifications.show({
        title: "Location Required",
        message: "Please select a mailing location before proceeding.",
        color: "orange",
      });
      return;
    }

    try {
      setLoadingPlan(planType);
      const result = await createSubscriptionInvoice(
        planType,
        billingCycle,
        selectedLocation || undefined
      );

      if (result.success) {
        window.location.href = result.invoiceUrl;
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
        message: "Something went wrong",
        color: "red",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs" align="center" ta="center">
        <Title order={1} fw={800} size="clamp(2rem, 5vw, 3rem)">
          Choose Your Plan
        </Title>
        <Text c="dimmed" size="lg" maw={600}>
          Select the perfect plan for your digital mailroom needs. All plans
          include secure mail handling and digital access.
        </Text>
      </Stack>
      {/* Mailing Location Selector */}
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{maxWidth: 400, margin: "0 auto"}}
      >
        <Stack gap="xs">
          <Text size="sm" fw={500} ta="center">
            Select Mailing Location:
          </Text>
          <Select
            placeholder="Choose a location"
            data={locations.map((l: any) => ({
              value: l.id,
              label: `${l.name} (${l.city})`,
            }))}
            value={selectedLocation}
            onChange={setSelectedLocation}
            searchable
            clearable={false}
          />
          {!selectedLocation && (
            <Text size="xs" c="orange" ta="center">
              Please select a location to subscribe
            </Text>
          )}
        </Stack>
      </Paper>
      {/* Billing Cycle Selector */}
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{maxWidth: 400, margin: "0 auto"}}
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
      {/* Pricing Cards */}
      <SimpleGrid
        cols={{base: 1, sm: 2, lg: packages.length}}
        spacing={{base: "md", md: "xl"}}
      >
        {packages.map((pkg) => {
          const price = getPrice(pkg);
          const isCurrentPlan = pkg.plan_type === currentPlanType;
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
                {/* Plan Header */}
                <Stack gap="xs" align="center" ta="center">
                  <ThemeIcon
                    size={60}
                    radius="xl"
                    variant="light"
                    color={isFeatured ? "blue" : "gray"}
                  >
                    {pkg.plan_type === "BUSINESS" ? (
                      <IconBuilding size={30} />
                    ) : pkg.plan_type === "ENTERPRISE" ? (
                      <IconRocket size={30} />
                    ) : (
                      <IconCrown size={30} />
                    )}
                  </ThemeIcon>
                  <Title order={2} size="h3" fw={700}>
                    {pkg.name}
                  </Title>
                  {pkg.description && (
                    <Text size="sm" c="dimmed">
                      {pkg.description}
                    </Text>
                  )}
                </Stack>

                <Divider />

                {/* Pricing */}
                <Stack gap={4} align="center">
                  <Group gap={4} align="flex-end" justify="center">
                    <Title order={2} size="2.5rem" fw={800}>
                      ₱{price.toLocaleString()}
                    </Title>
                    <Text size="sm" c="dimmed" mb={8}>
                      {getPeriod()}
                    </Text>
                  </Group>
                  {billingCycle === "YEARLY" && pkg.price_yearly && (
                    <Text size="xs" c="green">
                      Save ₱
                      {(
                        (pkg.price_monthly * 12 - pkg.price_yearly) /
                        12
                      ).toFixed(0)}
                      /month
                    </Text>
                  )}
                </Stack>

                <Divider />

                {/* Features */}
                <Stack gap="sm">
                  {pkg.features.map((feature, index) => (
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
                  ))}
                </Stack>

                {/* CTA Button */}
                <Button
                  fullWidth
                  size="lg"
                  variant={isFeatured ? "filled" : "outline"}
                  color="blue"
                  leftSection={<IconCreditCard size={18} />}
                  disabled={
                    isCurrentPlan ||
                    !!loadingPlan ||
                    (!selectedLocation && !isCurrentPlan)
                  }
                  loading={loadingPlan === pkg.plan_type}
                  onClick={() => handleSelectPlan(pkg.plan_type)}
                  mt="auto"
                >
                  {isCurrentPlan ? "Current Plan" : "Select Plan"}
                </Button>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>
      // ... existing code ...
      {/* Current Plan Notice */}
      {currentPlanType !== "FREE" && (
        <Paper
          withBorder
          p="md"
          radius="md"
          style={{maxWidth: 600, margin: "0 auto"}}
        >
          <Text size="sm" ta="center" c="dimmed">
            You are currently on the{" "}
            <Text span fw={600} c="blue">
              {packages.find((p) => p.plan_type === currentPlanType)?.name ||
                currentPlanType}
            </Text>{" "}
            plan
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
