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
import {IconShield, IconCheck} from "@tabler/icons-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="xs" align="center" ta="center">
          <ThemeIcon size={80} radius="xl" variant="light" color="blue">
            <IconShield size={40} />
          </ThemeIcon>
          <Title order={1} fw={800} size="2.5rem">
            Privacy Policy
          </Title>
          <Text c="dimmed" size="lg">
            Last updated: January 2025
          </Text>
        </Stack>

        <Paper withBorder p="xl" radius="md">
          <Stack gap="lg">
            <Box>
              <Title order={2} size="h3" mb="md">
                1. Introduction
              </Title>
              <Text size="sm" c="dimmed">
                Keep PH - Digital Mailbox ("we," "our," or "us") is committed to
                protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our digital mail management service.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                2. Information We Collect
              </Title>
              <Text size="sm" c="dimmed" mb="sm">
                We collect the following types of information:
              </Text>

              <Title order={3} size="h4" mt="md" mb="sm">
                2.1 Personal Information
              </Title>
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="blue" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>Name, date of birth, and contact information</List.Item>
                <List.Item>Address and location details</List.Item>
                <List.Item>Phone number and email address</List.Item>
                <List.Item>Government-issued ID documents (for KYC verification)</List.Item>
                <List.Item>Payment and billing information</List.Item>
              </List>

              <Title order={3} size="h4" mt="md" mb="sm">
                2.2 Mail Content
              </Title>
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="blue" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>Envelope scans and images</List.Item>
                <List.Item>Full document scans</List.Item>
                <List.Item>Mail metadata (sender, date, subject)</List.Item>
                <List.Item>Tags, categories, and notes you create</List.Item>
              </List>

              <Title order={3} size="h4" mt="md" mb="sm">
                2.3 Usage Data
              </Title>
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="blue" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>Account activity and login information</List.Item>
                <List.Item>Service usage patterns</List.Item>
                <List.Item>Device and browser information</List.Item>
                <List.Item>IP address and location data</List.Item>
              </List>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                3. How We Use Your Information
              </Title>
              <Text size="sm" c="dimmed" mb="sm">
                We use the collected information for the following purposes:
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
                  To provide, maintain, and improve our mail management service
                </List.Item>
                <List.Item>
                  To process and deliver your physical mail
                </List.Item>
                <List.Item>
                  To verify your identity through KYC procedures
                </List.Item>
                <List.Item>
                  To process payments and manage subscriptions
                </List.Item>
                <List.Item>
                  To communicate with you about your account and service updates
                </List.Item>
                <List.Item>
                  To comply with legal obligations and prevent fraud
                </List.Item>
                <List.Item>
                  To analyze usage patterns and improve user experience
                </List.Item>
              </List>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                4. Data Storage and Security
              </Title>
              <Text size="sm" c="dimmed" mb="sm">
                We implement appropriate technical and organizational measures to
                protect your information:
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
                  Encryption of data in transit and at rest
                </List.Item>
                <List.Item>
                  Secure storage facilities for physical mail
                </List.Item>
                <List.Item>
                  Access controls and authentication mechanisms
                </List.Item>
                <List.Item>
                  Regular security audits and monitoring
                </List.Item>
                <List.Item>
                  Employee training on data protection
                </List.Item>
              </List>
              <Text size="sm" c="dimmed" mt="sm">
                However, no method of transmission over the Internet or
                electronic storage is 100% secure. While we strive to use
                commercially acceptable means to protect your information, we
                cannot guarantee absolute security.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                5. Data Sharing and Disclosure
              </Title>
              <Text size="sm" c="dimmed" mb="sm">
                We do not sell your personal information. We may share your
                information only in the following circumstances:
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
                  With service providers who assist in operating our service
                  (under strict confidentiality agreements)
                </List.Item>
                <List.Item>
                  When required by law, court order, or government regulation
                </List.Item>
                <List.Item>
                  To protect our rights, property, or safety, or that of our
                  users
                </List.Item>
                <List.Item>
                  In connection with a business transfer or merger (with notice
                  to users)
                </List.Item>
                <List.Item>
                  With your explicit consent for specific purposes
                </List.Item>
              </List>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                6. Your Rights and Choices
              </Title>
              <Text size="sm" c="dimmed" mb="sm">
                You have the following rights regarding your personal information:
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
                  <strong>Access:</strong> Request access to your personal data
                </List.Item>
                <List.Item>
                  <strong>Correction:</strong> Request correction of inaccurate
                  information
                </List.Item>
                <List.Item>
                  <strong>Deletion:</strong> Request deletion of your data
                  (subject to legal retention requirements)
                </List.Item>
                <List.Item>
                  <strong>Portability:</strong> Request a copy of your data in a
                  portable format
                </List.Item>
                <List.Item>
                  <strong>Objection:</strong> Object to certain processing
                  activities
                </List.Item>
                <List.Item>
                  <strong>Withdrawal:</strong> Withdraw consent where processing
                  is based on consent
                </List.Item>
              </List>
              <Text size="sm" c="dimmed" mt="sm">
                To exercise these rights, please contact us at
                privacy@digitalmailroom.com.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                7. Data Retention
              </Title>
              <Text size="sm" c="dimmed">
                We retain your personal information for as long as necessary to
                provide our services and fulfill the purposes outlined in this
                policy, unless a longer retention period is required or permitted
                by law. Digital mail copies are retained according to your
                account settings and subscription plan. Physical mail is retained
                according to your instructions or disposed of in accordance with
                our retention policy.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                8. Children's Privacy
              </Title>
              <Text size="sm" c="dimmed">
                Our Service is not intended for individuals under the age of 18.
                We do not knowingly collect personal information from children. If
                you become aware that a child has provided us with personal
                information, please contact us, and we will take steps to delete
                such information.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                9. International Data Transfers
              </Title>
              <Text size="sm" c="dimmed">
                Your information may be transferred to and processed in countries
                other than your country of residence. We ensure that appropriate
                safeguards are in place to protect your information in accordance
                with this Privacy Policy and applicable data protection laws.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                10. Cookies and Tracking Technologies
              </Title>
              <Text size="sm" c="dimmed">
                We use cookies and similar tracking technologies to track activity
                on our Service and store certain information. You can instruct
                your browser to refuse all cookies or to indicate when a cookie
                is being sent. However, if you do not accept cookies, you may not
                be able to use some portions of our Service.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                11. Changes to This Privacy Policy
              </Title>
              <Text size="sm" c="dimmed">
                We may update our Privacy Policy from time to time. We will notify
                you of any changes by posting the new Privacy Policy on this page
                and updating the "Last updated" date. You are advised to review
                this Privacy Policy periodically for any changes.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Title order={2} size="h3" mb="md">
                12. Contact Us
              </Title>
              <Text size="sm" c="dimmed">
                If you have any questions about this Privacy Policy or wish to
                exercise your rights, please contact us at:
              </Text>
              <Text size="sm" mt="xs">
                <strong>Email:</strong> privacy@digitalmailroom.com
              </Text>
              <Text size="sm">
                <strong>Address:</strong> Keep PH - Digital Mailbox, Philippines
              </Text>
              <Text size="sm" mt="sm" c="dimmed">
                For data protection inquiries, you may also contact our Data
                Protection Officer at dpo@digitalmailroom.com.
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

