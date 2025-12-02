import {
  Button,
  Container,
  Text,
  Title,
  Paper,
  Stack,
  ThemeIcon,
  Group,
} from "@mantine/core";
import {IconCrown, IconCheck, IconX} from "@tabler/icons-react";
import Link from "next/link";

export function UpgradePrompt() {
  const freePlanFeatures = [
    {text: "Earn while you refer", available: true},
    {text: "Affiliate link access", available: true},
    {text: "Track your referrals", available: true},
    {text: "No mail services", available: false},
  ];

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="md" shadow="sm">
        <Stack align="center" gap="lg">
          <Stack gap="xs" align="center">
            <Title order={2} ta="center">
              Free Plan Features
            </Title>
            <Text c="dimmed" ta="center" maw={400}>
              You are currently on the Free Plan. Here's what you have access
              to:
            </Text>
          </Stack>

          <Stack gap="sm" style={{width: "100%"}}>
            {freePlanFeatures.map((feature, index) => (
              <Group key={index} gap="sm" align="flex-start">
                <ThemeIcon
                  color={feature.available ? "green" : "red"}
                  variant="transparent"
                  size="sm"
                  mt={2}
                >
                  {feature.available ? (
                    <IconCheck size={16} />
                  ) : (
                    <IconX size={16} />
                  )}
                </ThemeIcon>
                <Text size="sm" c={feature.available ? undefined : "dimmed"}>
                  {feature.text}
                </Text>
              </Group>
            ))}
          </Stack>

          <Button
            component={Link}
            href="/app/pricing"
            size="lg"
            leftSection={<IconCrown size={20} />}
            fullWidth
            mt="md"
          >
            Upgrade to Paid Plan
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
