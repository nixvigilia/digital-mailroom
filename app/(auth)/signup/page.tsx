"use client";

import {useActionState, useEffect, useState, startTransition} from "react";
import Link from "next/link";
import {signup, type ActionResult} from "@/app/actions/auth";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Progress,
  Alert,
  Anchor,
  List,
} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {IconAlertCircle, IconCheck, IconX} from "@tabler/icons-react";
import {checkPasswordStrength} from "@/lib/password-strength";

function PasswordStrengthIndicator({password}: {password: string}) {
  if (!password) return null;

  const strength = checkPasswordStrength(password);
  const progressValue =
    strength.score === 0
      ? 0
      : strength.score === 1
      ? 25
      : strength.score === 2
      ? 50
      : strength.score === 3
      ? 75
      : 100;

  const progressColor =
    strength.strength === "weak"
      ? "red"
      : strength.strength === "medium"
      ? "yellow"
      : "green";

  return (
    <Stack gap="xs">
      <Progress value={progressValue} color={progressColor} size="sm" />
      <List size="xs" spacing={4}>
        <List.Item
          icon={
            password.length >= 8 ? (
              <IconCheck size={14} color="green" />
            ) : (
              <IconX size={14} color="red" />
            )
          }
        >
          At least 8 characters
        </List.Item>
        <List.Item
          icon={
            strength.hasUpperCase ? (
              <IconCheck size={14} color="green" />
            ) : (
              <IconX size={14} color="red" />
            )
          }
        >
          One uppercase letter
        </List.Item>
        <List.Item
          icon={
            strength.hasLowerCase ? (
              <IconCheck size={14} color="green" />
            ) : (
              <IconX size={14} color="red" />
            )
          }
        >
          One lowercase letter
        </List.Item>
        <List.Item
          icon={
            strength.hasNumbers ? (
              <IconCheck size={14} color="green" />
            ) : (
              <IconX size={14} color="red" />
            )
          }
        >
          One number
        </List.Item>
      </List>
    </Stack>
  );
}

export default function SignupPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupState, signupAction, signupPending] = useActionState<
    ActionResult | null,
    FormData
  >(signup, null);

  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const passwordStrength = checkPasswordStrength(password);
  const isFormValid = passwordStrength.isValid && passwordsMatch;

  useEffect(() => {
    if (signupState) {
      if (signupState.success) {
        notifications.show({
          title: "Success",
          message: signupState.message,
          color: "green",
          icon: <IconCheck size={18} />,
        });
      } else {
        notifications.show({
          title: "Error",
          message: signupState.message,
          color: "red",
          icon: <IconAlertCircle size={18} />,
        });
      }
    }
  }, [signupState]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const passwordValue = formData.get("password") as string;
    const confirmPasswordValue = formData.get("confirmPassword") as string;

    if (passwordValue !== confirmPasswordValue) {
      notifications.show({
        title: "Error",
        message: "Passwords do not match.",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    const strength = checkPasswordStrength(passwordValue);
    if (!strength.isValid) {
      notifications.show({
        title: "Error",
        message: "Password is too weak. Please strengthen it.",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    startTransition(() => {
      signupAction(formData);
    });
  };

  return (
    <Container size={420} my={40}>
      <Stack gap="md">
        <Title ta="center" fw={700} size="2rem">
          Create Account
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          Enter your information to create a new account
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md">
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="you@example.com"
                name="email"
                type="email"
                required
                disabled={signupPending}
                size="md"
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={signupPending}
                size="md"
              />
              <PasswordStrengthIndicator password={password} />

              <PasswordInput
                label="Confirm Password"
                placeholder="••••••••"
                name="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={signupPending}
                size="md"
                error={
                  confirmPassword.length > 0 && !passwordsMatch
                    ? "Passwords do not match"
                    : null
                }
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={signupPending}
                disabled={signupPending || !isFormValid}
              >
                {signupPending ? "Creating account..." : "Sign Up"}
              </Button>
            </Stack>
          </form>

          <Text c="dimmed" size="sm" ta="center" mt="md">
            Already have an account?{" "}
            <Anchor component={Link} href="/login" size="sm">
              Sign in
            </Anchor>
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}
