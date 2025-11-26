"use client";

import {
  Container,
  Title,
  Text,
  Button,
  Grid,
  Card,
  Stack,
  Group,
  ThemeIcon,
  Box,
  TextInput,
  Badge,
  Paper,
  Divider,
  Anchor,
} from "@mantine/core";
import {
  IconMail,
  IconPackage,
  IconBuilding,
  IconCheck,
  IconArrowRight,
  IconMapPin,
  IconPhone,
  IconMail as IconEmail,
} from "@tabler/icons-react";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

export default function HomePage() {
  const whyDigitize = [
    {
      icon: IconMail,
      title: "Digitized Mail",
      description:
        "We scan every piece of mail you receive. Access high-quality digital copies through our platform within hours.",
      label: "Mail scanning",
    },
    {
      icon: IconPackage,
      title: "Permanent Address",
      description:
        "Moving frequently? Your Digital Mailroom address stays the same. Never update your mailing address again.",
      label: "Package delivery",
    },
    {
      icon: IconBuilding,
      title: "Virtual Office",
      description:
        "Professional business address. Perfect for startups and businesses needing a virtual presence.",
      label: "Virtual office",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Get Your Address",
      description: "Sign up and receive your unique Digital Mailroom mailing address",
    },
    {
      step: "2",
      title: "We Receive & Scan",
      description: "Your mail arrives, we scan it and upload to your account",
    },
    {
      step: "3",
      title: "Access Anywhere",
      description: "View your digitized mail on any device, anytime",
    },
  ];

  const pricingPlans = [
    {
      name: "Digital",
      price: "₱299",
      period: "/month",
      description: "For individuals who just need their mail digitized",
      features: [
        "Mail scanning & digitization",
        "5GB digital storage",
        "7-day physical retention",
        "~5,000 scanned pages",
        "Access via web app",
        "Standard quality scans",
        "No parcel handling",
      ],
      cta: "I'm interested!",
      popular: false,
      for: "For personal use only",
    },
    {
      name: "Personal",
      price: "₱499",
      period: "/month",
      description: "Complete mail management solution",
      features: [
        "Everything in Digital",
        "20GB digital storage",
        "Parcel handling",
        "~20,000 scanned pages",
        "90-day physical retention",
        "High quality scans",
        "Starter kit included",
      ],
      cta: "I'm interested!",
      popular: true,
      for: "For personal use only",
    },
    {
      name: "Business",
      price: "₱2,999",
      period: "/month",
      description: "Professional virtual office solution",
      features: [
        "Everything in Personal",
        "200GB digital storage",
        "Virtual office address",
        "~200,000 scanned pages",
        "365-day physical retention",
        "Business registration use",
        "Professional business address",
      ],
      cta: "I'm interested!",
      popular: false,
      for: "For business use",
    },
  ];

  return (
    <Box>
      {/* Navigation */}
      <Box
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-3)",
          padding: "1rem 0",
        }}
      >
        <Container size="lg">
          <Group justify="space-between" align="center">
            <Title order={2} size="h3" fw={700}>
              Digital Mailroom
            </Title>
            <Group gap="lg">
              <Anchor href="#pricing" c="dark" fw={500}>
                Pricing
              </Anchor>
              <Anchor href="#contact" c="dark" fw={500}>
                Contact Us
              </Anchor>
              <AuthButton />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container size="lg" py={100}>
        <Stack gap="xl" align="center" style={{ textAlign: "center" }}>
          <Title
            order={1}
            size="3.5rem"
            fw={800}
            style={{ lineHeight: 1.2, maxWidth: "800px" }}
          >
            Your Mail, Always Within Reach.
          </Title>
          <Text size="xl" c="dimmed" maw={700}>
            We digitize your physical mail so you can access it anytime,
            anywhere. No more worrying about missing important documents—view
            them all online.
          </Text>
          <Button
            component={Link}
            href="/signup"
            size="lg"
            variant="filled"
            color="blue"
            rightSection={<IconArrowRight size={20} />}
          >
            Join the Waitlist
          </Button>
          <Text size="sm" c="dimmed" mt="md">
            Get a quick overview of how we digitize and deliver your mail
            through our secure online platform.
          </Text>
        </Stack>
      </Container>

      {/* Why Digitize Your Mail Section */}
      <Box bg="gray.0" py={80}>
        <Container size="lg">
          <Stack gap="xl" align="center" mb={60}>
            <Title order={2} size="2.5rem" fw={700} ta="center">
              Why Digitize Your Mail?
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={600}>
              Access your physical mail from anywhere in the world
            </Text>
          </Stack>
          <Grid>
            {whyDigitize.map((item, index) => (
              <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                <Card shadow="sm" padding="xl" radius="md" withBorder h="100%">
                  <Stack gap="md">
                    <Badge color="blue" variant="light" size="lg" w="fit-content">
                      {item.label}
                    </Badge>
                    <ThemeIcon size={60} radius="md" variant="light" color="blue">
                      <item.icon size={30} />
                    </ThemeIcon>
                    <Title order={3} size="h4" fw={600}>
                      {item.title}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {item.description}
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container size="lg" py={80}>
        <Stack gap="xl" align="center" mb={60}>
          <Title order={2} size="2.5rem" fw={700} ta="center">
            How It Works
          </Title>
        </Stack>
        <Grid>
          {howItWorks.map((step, index) => (
            <Grid.Col key={index} span={{ base: 12, md: 4 }}>
              <Stack gap="md" align="center" ta="center">
                <ThemeIcon
                  size={80}
                  radius="xl"
                  variant="filled"
                  color="blue"
                  style={{ fontSize: "2rem", fontWeight: 700 }}
                >
                  {step.step}
                </ThemeIcon>
                <Title order={3} size="h4" fw={600}>
                  {step.title}
                </Title>
                <Text size="sm" c="dimmed" maw={300}>
                  {step.description}
                </Text>
              </Stack>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box bg="gray.0" py={80} id="pricing">
        <Container size="lg">
          <Stack gap="xl" align="center" mb={60}>
            <Title order={2} size="2.5rem" fw={700} ta="center">
              Simple, Transparent Pricing
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={600}>
              Choose the plan that fits your needs
            </Text>
          </Stack>
          <Grid>
            {pricingPlans.map((plan, index) => (
              <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                <Paper
                  shadow="sm"
                  p="xl"
                  radius="md"
                  withBorder
                  h="100%"
                  style={{
                    position: "relative",
                    border: plan.popular
                      ? "2px solid var(--mantine-color-blue-6)"
                      : undefined,
                  }}
                >
                  {plan.popular && (
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
                      POPULAR
                    </Badge>
                  )}
                  <Stack gap="md">
                    <Stack gap={4}>
                      <Title order={3} size="h3" fw={700}>
                        {plan.name}
                      </Title>
                      <Group gap={4} align="flex-end">
                        <Title order={2} size="2.5rem" fw={800}>
                          {plan.price}
                        </Title>
                        <Text size="sm" c="dimmed" mb={8}>
                          {plan.period}
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        {plan.description}
                      </Text>
                    </Stack>
                    <Divider />
                    <Stack gap="xs">
                      {plan.features.map((feature, idx) => (
                        <Group key={idx} gap="sm" align="flex-start">
                          <ThemeIcon
                            color="green"
                            variant="transparent"
                            size="sm"
                            mt={2}
                          >
                            <IconCheck size={16} />
                          </ThemeIcon>
                          <Text size="sm">{feature}</Text>
                        </Group>
                      ))}
                    </Stack>
                    <Button
                      fullWidth
                      mt="auto"
                      variant={plan.popular ? "filled" : "outline"}
                      color="blue"
                      size="md"
                    >
                      {plan.cta}
                    </Button>
                    <Text size="xs" c="dimmed" ta="center">
                      {plan.for}
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Waitlist Section */}
      <Container size="lg" py={80}>
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Stack gap="xl" align="center" style={{ textAlign: "center" }}>
            <Title order={2} size="2.5rem" fw={700}>
              Join Our Waitlist
            </Title>
            <Text size="lg" c="dimmed" maw={600}>
              Be the first to know when we officially launch. Show your interest
              today!
            </Text>
            <Group gap="md" style={{ width: "100%", maxWidth: 500 }}>
              <TextInput
                placeholder="Email Address"
                style={{ flex: 1 }}
                size="md"
              />
              <Button size="md" variant="filled" color="blue">
                Show Interest
              </Button>
            </Group>
            <Text size="sm" c="dimmed">
              Digital Mailroom launches soon.
            </Text>
          </Stack>
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        bg="gray.9"
        style={{ color: "white" }}
        py={60}
        id="contact"
      >
        <Container size="lg">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Title order={4} size="h4" fw={600} c="white">
                  Our Location
                </Title>
                <Group gap="sm" c="gray.4">
                  <IconMapPin size={20} />
                  <Text c="gray.4">
                    Digital Mailroom Service
                    <br />
                    Secure Mail Processing Facility
                  </Text>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Title order={4} size="h4" fw={600} c="white">
                  Contact Us
                </Title>
                <Group gap="sm" c="gray.4">
                  <IconEmail size={20} />
                  <Anchor href="mailto:admin@digitalmailroom.com" c="gray.4">
                    admin@digitalmailroom.com
                  </Anchor>
                </Group>
                <Group gap="sm" c="gray.4">
                  <IconPhone size={20} />
                  <Anchor href="tel:+1234567890" c="gray.4">
                    +1 (234) 567-890
                  </Anchor>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
          <Divider my="xl" color="gray.7" />
          <Group justify="space-between" align="center">
            <Text size="sm" c="gray.5">
              © 2025 Digital Mailroom Service. All rights reserved.
            </Text>
            <Group gap="md">
              <Anchor href="#" c="gray.5" size="sm">
                Terms of Use
              </Anchor>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
