"use client";

import {Card, Stack, Text, ThemeIcon, Group} from "@mantine/core";
import {Icon} from "@tabler/icons-react";

interface ReferralStatsCardProps {
  title: string;
  value: string | number;
  icon: typeof Icon;
  color: string;
}

export function ReferralStatsCard({
  title,
  value,
  icon: Icon,
  color,
}: ReferralStatsCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder={false}>
      <Stack gap="xs">
        <Group gap="sm" justify="space-between" align="flex-start">
          <Stack gap={2} style={{flex: 1}}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              {title}
            </Text>
            <Text size="xl" fw={700} style={{lineHeight: 1}}>
              {value}
            </Text>
          </Stack>
          <ThemeIcon
            size={36}
            radius="md"
            variant="light"
            color={color}
            style={{opacity: 0.8}}
          >
            <Icon size={18} />
          </ThemeIcon>
        </Group>
      </Stack>
    </Card>
  );
}
