"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { login, type ActionResult } from "@/app/actions/auth";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Anchor,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

export default function LoginPage() {
  const [loginState, loginAction, loginPending] = useActionState<
    ActionResult | null,
    FormData
  >(login, null);

  useEffect(() => {
    if (loginState) {
      if (loginState.success) {
        notifications.show({
          title: "Success",
          message: "Successfully signed in!",
          color: "green",
          icon: <IconCheck size={18} />,
        });
      } else {
        notifications.show({
          title: "Error",
          message: loginState.message,
          color: "red",
          icon: <IconAlertCircle size={18} />,
        });
      }
    }
  }, [loginState]);

  return (
    <Container size={420} my={40}>
      <Stack gap="md">
        <Title ta="center" fw={700} size="2rem">
          Welcome Back
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          Enter your credentials to sign in to your account
        </Text>

        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Shared Database"
          color="blue"
          variant="light"
        >
          This app shares its database with Secret Page App, so you can reuse
          your existing account.
        </Alert>

        <Paper withBorder shadow="md" p={30} radius="md">
          <form action={loginAction}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="you@example.com"
                name="email"
                type="email"
                required
                disabled={loginPending}
                size="md"
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                name="password"
                required
                disabled={loginPending}
                size="md"
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={loginPending}
                disabled={loginPending}
              >
                {loginPending ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </form>

          <Text c="dimmed" size="sm" ta="center" mt="md">
            Don&apos;t have an account?{" "}
            <Anchor component={Link} href="/signup" size="sm">
              Sign up
            </Anchor>
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}
