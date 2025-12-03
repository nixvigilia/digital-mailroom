"use client";

import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  Code,
  ActionIcon,
  Tooltip,
  Divider,
  Badge,
  Card,
  ThemeIcon,
  CopyButton,
} from "@mantine/core";
import {
  IconCopy,
  IconCheck,
  IconLink,
  IconQrcode,
  IconShieldCheck,
  IconFingerprint,
} from "@tabler/icons-react";

interface ReferralLinkCardProps {
  referralCode: string;
  referralLink: string;
  onCopy: (text: string) => void;
  copied: boolean;
}

export function ReferralLinkCard({
  referralCode,
  referralLink,
  onCopy,
  copied,
}: ReferralLinkCardProps) {
  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder={false}>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconShieldCheck size={20} />
            </ThemeIcon>
            <Stack gap={0}>
              <Text size="lg" fw={700}>
                Referral Credentials
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                SECURE ID: {referralCode}
              </Text>
            </Stack>
          </Group>
          <Badge variant="dot" color="green" size="lg" tt="uppercase" fw={700}>
            Active
          </Badge>
        </Group>

        <Stack gap="md">
          {/* Code Display */}
          <Paper
            p="md"
            radius="md"
            bg="var(--mantine-color-gray-0)"
            style={{border: "1px dashed var(--mantine-color-gray-3)"}}
          >
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                  Unique Referral Code
                </Text>
                <IconFingerprint
                  size={16}
                  color="var(--mantine-color-dimmed)"
                />
              </Group>
              <Group justify="space-between" align="center">
                <Text
                  size="xl"
                  fw={800}
                  style={{letterSpacing: "1px", fontFamily: "monospace"}}
                >
                  {referralCode}
                </Text>
                <CopyButton value={referralCode} timeout={2000}>
                  {({copied, copy}) => (
                    <Tooltip
                      label={copied ? "Copied" : "Copy code"}
                      withArrow
                      position="right"
                    >
                      <ActionIcon
                        color={copied ? "green" : "gray"}
                        variant="subtle"
                        onClick={copy}
                        size="lg"
                      >
                        {copied ? (
                          <IconCheck size={18} />
                        ) : (
                          <IconCopy size={18} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </Stack>
          </Paper>

          {/* Link Display */}
          <Stack gap="xs">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase">
              Secure Link
            </Text>
            <Group gap="xs">
              <Code
                block
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  backgroundColor: "transparent",
                  padding: 0,
                  fontSize: "0.9rem",
                }}
              >
                {referralLink}
              </Code>
              <Button
                variant="light"
                color="blue"
                size="xs"
                leftSection={<IconLink size={14} />}
                onClick={() => onCopy(referralLink)}
              >
                Copy Link
              </Button>
            </Group>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
