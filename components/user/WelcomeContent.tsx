"use client";

import {
  Title,
  Text,
  Stack,
  Paper,
  Button,
  ThemeIcon,
  Box,
  Container,
  Group,
  SimpleGrid,
} from "@mantine/core";
import {
  IconMail,
  IconArrowRight,
  IconShield,
  IconFileText,
  IconPhoto,
  IconInbox,
} from "@tabler/icons-react";
import Link from "next/link";

export function WelcomeContent() {
  const features = [
    {
      icon: IconPhoto,
      title: "View Envelope Scans",
      description: "See what mail you've received before it's opened.",
    },
    {
      icon: IconFileText,
      title: "Request Full Document Scans",
      description: "Get digital copies of your important documents.",
    },
    {
      icon: IconShield,
      title: "Secure & Compliant",
      description: "Bank-level security with full compliance standards.",
    },
    {
      icon: IconInbox,
      title: "Organize & Manage",
      description: "Tag, categorize, and archive your mail digitally.",
    },
  ];

  return (
    <Container size="md" py={{base: "xl", md: "xl"}}>
      <Stack gap="xl" style={{width: "100%"}}>
        {/* Welcome Header */}
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
            <IconMail size={40} color="var(--mantine-color-blue-6)" />
          </Box>
          <Title order={1} fw={700} size="clamp(2rem, 5vw, 3rem)">
            Welcome to Digital Mailroom
          </Title>
          <Text size="lg" c="dimmed" maw={600}>
            Your secure digital mail management solution. Receive, organize, and
            manage your physical mail from anywhere.
          </Text>
        </Stack>

        {/* What You Can Do - Features */}
        <Paper withBorder p={{base: "xl", md: "xl"}} radius="lg">
          <Stack gap="xl">
            <Title order={2} size="h3" fw={700} ta="center" mb="md">
              What You Can Do
            </Title>
            <SimpleGrid
              cols={{base: 1, md: 2}}
              spacing={{base: "md", md: "xl"}}
            >
              {features.map((feature, index) => (
                <Group key={index} gap="md" align="flex-start" wrap="nowrap">
                  <Box
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "var(--mantine-radius-md)",
                      backgroundColor: "var(--mantine-color-blue-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <feature.icon
                      size={24}
                      color="var(--mantine-color-blue-6)"
                    />
                  </Box>
                  <Box style={{flex: 1}}>
                    <Text fw={600} size="lg" mb={4}>
                      {feature.title}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {feature.description}
                    </Text>
                  </Box>
                </Group>
              ))}
            </SimpleGrid>
          </Stack>
        </Paper>

        {/* Complete Your KYC Verification */}
        <Paper
          withBorder
          p={{base: "xl", md: "xl"}}
          radius="lg"
          style={{textAlign: "center"}}
        >
          <Stack gap="md" align="center">
            <Title order={2} size="h3" fw={700}>
              Complete Your KYC Verification
            </Title>
            <Text size="md" c="dimmed" maw={500}>
              To start receiving mail, you need to complete your Identity
              Verification (KYC). This process is required for security and
              compliance.
            </Text>
            <Button
              component={Link}
              href="/user/kyc"
              size="lg"
              variant="filled"
              color="blue"
              rightSection={<IconArrowRight size={18} />}
              mt="md"
            >
              Get Started
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
