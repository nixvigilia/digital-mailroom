"use client";

import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Divider,
  Box,
  List,
  ThemeIcon,
  Group,
  Button,
} from "@mantine/core";
import {IconCheck, IconMail} from "@tabler/icons-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="xs" align="center" ta="center">
          <ThemeIcon size={80} radius="xl" variant="light" color="blue">
            <IconMail size={40} />
          </ThemeIcon>
          <Title order={1} fw={800} size="2.5rem">
            Terms of Service
          </Title>
          <Text c="dimmed" size="lg">
            Last updated: January 2025
          </Text>
        </Stack>

        <Paper withBorder p="xl" radius="md">
          <Stack gap="lg">
            <Box>
              <Title order={2} size="h3" mb="md">
                1. Acceptance of Terms
              </Title>
              <Text size="sm" c="dimmed">
                By accessing and using Digital Mailroom Service ("the Service"),
                you accept and agree to be bound by the terms and provision of
                this agreement. If you do not agree to abide by the above, please
                do not use this service.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                2. Description of Service
              </Title>
              <Text size="sm" c="dimmed" mb="sm">
                Digital Mailroom Service provides a digital mail management
                platform that allows users to:
              </Text>
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="blue" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>Receive physical mail at a secure facility</List.Item>
                <List.Item>
                  View envelope scans and request full document scans
                </List.Item>
                <List.Item>
                  Request physical mail actions (forward, hold, shred)
                </List.Item>
                <List.Item>
                  Organize mail with tags and categories
                </List.Item>
                <List.Item>Download digital copies of mail items</List.Item>
              </List>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                3. User Accounts and KYC Verification
              </Title>
              <Text size="sm" c="dimmed" mb="sm">
                To use the Service, you must:
              </Text>
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="blue" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  Create an account with accurate information
                </List.Item>
                <List.Item>
                  Complete Know Your Customer (KYC) verification before
                  receiving mail
                </List.Item>
                <List.Item>
                  Maintain the security of your account credentials
                </List.Item>
                <List.Item>
                  Notify us immediately of any unauthorized access
                </List.Item>
              </List>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                4. Mail Handling and Consent
              </Title>
              <Text size="sm" c="dimmed" mb="sm">
                By using the Service, you consent to:
              </Text>
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="blue" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  Digital Mailroom opening and scanning your physical mail
                </List.Item>
                <List.Item>
                  Processing and storing digital copies of your mail
                </List.Item>
                <List.Item>
                  Mail being received only for the account holder name or
                  pre-authorized senders
                </List.Item>
              </List>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                5. User Responsibilities
              </Title>
              <Text size="sm" c="dimmed" mb="sm">
                You agree to:
              </Text>
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="blue" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  Provide accurate and truthful information during registration
                  and KYC
                </List.Item>
                <List.Item>
                  Use the Service only for lawful purposes
                </List.Item>
                <List.Item>
                  Not attempt to access other users' mail or accounts
                </List.Item>
                <List.Item>
                  Not use the Service to receive mail for unauthorized persons
                </List.Item>
                <List.Item>
                  Comply with all applicable laws and regulations
                </List.Item>
              </List>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                6. Subscription and Billing
              </Title>
              <Text size="sm" c="dimmed">
                Subscription fees, billing cycles, and payment terms are
                specified in your account settings. You are responsible for
                maintaining valid payment information. We reserve the right to
                modify pricing with 30 days' notice. Failure to pay may result
                in service suspension or termination.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                7. Mail Storage and Retention
              </Title>
              <Text size="sm" c="dimmed">
                Digital copies of your mail will be stored securely. Physical
                mail will be retained according to your instructions (forward,
                hold, or shred). We reserve the right to dispose of unclaimed
                mail after a reasonable period as specified in our retention
                policy.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                8. Limitation of Liability
              </Title>
              <Text size="sm" c="dimmed">
                Digital Mailroom Service shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages,
                including but not limited to loss of mail, delays in delivery,
                or unauthorized access beyond our reasonable control. Our total
                liability shall not exceed the amount paid by you in the 12
                months preceding the claim.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                9. Service Modifications and Termination
              </Title>
              <Text size="sm" c="dimmed">
                We reserve the right to modify, suspend, or discontinue the
                Service at any time with or without notice. We may terminate
                your account if you violate these Terms or engage in fraudulent
                activity. Upon termination, you will lose access to your account
                and data.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                10. Intellectual Property
              </Title>
              <Text size="sm" c="dimmed">
                The Service, including its software, design, and content, is
                protected by intellectual property laws. You may not copy,
                modify, distribute, or create derivative works without our
                express written permission.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                11. Governing Law
              </Title>
              <Text size="sm" c="dimmed">
                These Terms shall be governed by and construed in accordance
                with the laws of the Philippines, without regard to its conflict
                of law provisions.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                12. Changes to Terms
              </Title>
              <Text size="sm" c="dimmed">
                We reserve the right to modify these Terms at any time. We will
                notify users of significant changes via email or through the
                Service. Continued use of the Service after changes constitutes
                acceptance of the new Terms.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                13. Contact Information
              </Title>
              <Text size="sm" c="dimmed">
                If you have any questions about these Terms of Service, please
                contact us at:
              </Text>
              <Text size="sm" mt="xs">
                <strong>Email:</strong> legal@digitalmailroom.com
              </Text>
              <Text size="sm">
                <strong>Address:</strong> Digital Mailroom Service, Philippines
              </Text>
            </Box>
          </Stack>
        </Paper>

        <Group justify="center" mt="xl">
          <Button component={Link} href="/" variant="light">
            Back to Home
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

