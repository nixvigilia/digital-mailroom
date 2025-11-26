"use client";

import { Container, Paper, Title, Text, Button, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={40} radius="md">
        <Stack gap="md" align="center" ta="center">
          <IconAlertCircle size={48} color="red" />
          <Title order={2} fw={700}>
            Something went wrong
          </Title>
          <Text c="dimmed">
            Sorry, we encountered an error while processing your request. Please
            try again.
          </Text>
          <Stack gap="xs" mt="md">
            <Button component={Link} href="/login" fullWidth>
              Go to Login
            </Button>
            <Button variant="subtle" onClick={() => router.back()} fullWidth>
              Go Back
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
