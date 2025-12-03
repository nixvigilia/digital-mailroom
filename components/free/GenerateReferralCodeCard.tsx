"use client";

import {useTransition, use} from "react";
import {
  Card,
  Stack,
  Group,
  Text,
  Button,
  Title,
  ThemeIcon,
  List,
  rem,
  Box,
  Divider,
} from "@mantine/core";
import {
  IconSparkles,
  IconCheck,
  IconAlertCircle,
  IconGift,
  IconX,
} from "@tabler/icons-react";
import {generateReferralCode} from "@/app/actions/referrals";
import {notifications} from "@mantine/notifications";

interface GenerateReferralCodeCardProps {
  onCodeGenerated: () => void;
  planDataPromise: Promise<{
    description: string | null;
    features: string[];
    not_included: string[];
    intended_for: string | null;
  } | null>;
}

export function GenerateReferralCodeCard({
  onCodeGenerated,
  planDataPromise,
}: GenerateReferralCodeCardProps) {
  const planData = use(planDataPromise);
  const features = planData?.features || [];
  const notIncluded = planData?.not_included || [];
  const description = planData?.description;

  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        const result = await generateReferralCode();
        if (result.success) {
          notifications.show({
            title: "Success!",
            message: result.message || "Your referral code has been generated!",
            color: "green",
            icon: <IconCheck size={18} />,
          });
          onCodeGenerated();
        } else {
          notifications.show({
            title: "Error",
            message: result.message || "Failed to generate referral code",
            color: "red",
            icon: <IconAlertCircle size={18} />,
          });
        }
      } catch (error) {
        console.error("Error generating referral code:", error);
        notifications.show({
          title: "Error",
          message: "Failed to generate referral code. Please try again.",
          color: "red",
          icon: <IconAlertCircle size={18} />,
        });
      }
    });
  };

  // Filter features to ensure no duplicates from not_included if they exist in both
  // Although visually we want to separate them
  const displayFeatures = features.filter((f) => !notIncluded.includes(f));

  return (
    <Card shadow="sm" padding="xl" radius="lg" withBorder>
      <Stack gap="lg">
        <Group wrap="nowrap" align="flex-start">
          <ThemeIcon size={48} radius="md" variant="light" color="blue">
            <IconGift size={26} stroke={1.5} />
          </ThemeIcon>
          <Stack gap={4}>
            <Title order={3} size="h4" fw={700}>
              Generate Referral Code
            </Title>
            <Text size="sm" c="dimmed" lh={1.5}>
              {description ||
                "Create your unique referral code to start earning rewards. Share your code with friends!"}
            </Text>
          </Stack>
        </Group>

        <Divider color="gray.2" />

        <Box>
          <Text size="xs" fw={700} c="dimmed" mb="md" tt="uppercase" lts={0.5}>
            Benefits & Features
          </Text>
          <List
            spacing="sm"
            size="sm"
            center
            icon={
              <ThemeIcon color="blue" variant="light" size={20} radius="xl">
                <IconCheck
                  style={{width: rem(12), height: rem(12)}}
                  stroke={3}
                />
              </ThemeIcon>
            }
          >
            {displayFeatures.map((feature, index) => (
              <List.Item key={`feat-${index}`}>
                <Text span c="dimmed.8" size="sm">
                  {feature}
                </Text>
              </List.Item>
            ))}
            {notIncluded.map((item, index) => (
              <List.Item
                key={`excl-${index}`}
                icon={
                  <ThemeIcon color="gray" variant="light" size={20} radius="xl">
                    <IconX
                      style={{width: rem(12), height: rem(12)}}
                      stroke={3}
                    />
                  </ThemeIcon>
                }
              >
                <Text span c="dimmed" size="sm" style={{opacity: 0.8}}>
                  {item}
                </Text>
              </List.Item>
            ))}
          </List>
        </Box>

        <Button
          onClick={handleGenerate}
          loading={isPending}
          size="md"
          leftSection={<IconSparkles size={18} />}
          fullWidth
          variant="gradient"
          gradient={{from: "blue", to: "cyan", deg: 90}}
          radius="md"
          fw={600}
        >
          {isPending ? "Generating..." : "Generate My Referral Code"}
        </Button>
      </Stack>
    </Card>
  );
}
