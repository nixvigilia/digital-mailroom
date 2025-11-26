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
  Anchor,
  Box,
  Group,
  Badge,
  ThemeIcon,
  Divider,
  Alert,
} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCheck,
  IconX,
  IconLock,
  IconMail,
  IconUserPlus,
  IconMailCheck,
} from "@tabler/icons-react";
import {checkPasswordStrength} from "@/lib/password-strength";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";

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

  const strengthLabel =
    strength.strength === "weak"
      ? "Weak"
      : strength.strength === "medium"
      ? "Medium"
      : "Strong";

  const requirements = [
    {met: password.length >= 8, label: "At least 8 characters"},
    {met: strength.hasUpperCase, label: "One uppercase letter"},
    {met: strength.hasLowerCase, label: "One lowercase letter"},
    {met: strength.hasNumbers, label: "One number"},
  ];

  return (
    <Box
      p="sm"
      style={{
        borderRadius: "var(--mantine-radius-md)",
        backgroundColor: "var(--mantine-color-gray-0)",
        border: "1px solid var(--mantine-color-gray-3)",
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text size="xs" fw={500} c="dimmed">
            Password Strength
          </Text>
          <Badge size="sm" color={progressColor} variant="light">
            {strengthLabel}
          </Badge>
        </Group>
        <Progress
          value={progressValue}
          color={progressColor}
          size="md"
          radius="xl"
          animated
        />
        <Divider />
        <Stack gap={6}>
          {requirements.map((req, index) => (
            <Group key={index} gap="xs" align="center">
              <ThemeIcon
                size={18}
                radius="xl"
                variant="light"
                color={req.met ? "green" : "gray"}
              >
                {req.met ? <IconCheck size={12} /> : <IconX size={12} />}
              </ThemeIcon>
              <Text
                size="xs"
                c={req.met ? "green" : "dimmed"}
                style={{
                  textDecoration: req.met ? "none" : "none",
                }}
              >
                {req.label}
              </Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export default function SignupPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
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
        // Clear form fields
        setPassword("");
        setConfirmPassword("");
        setShowConfirmation(true);
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
    const emailValue = formData.get("email") as string;
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

    // Store email for confirmation message
    setEmail(emailValue);

    startTransition(() => {
      signupAction(formData);
    });
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <Box
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <Container size={480}>
          <Stack gap="xl">
            <Stack gap="xs" align="center" ta="center">
              <ThemeIcon
                size={64}
                radius="xl"
                variant="light"
                color="blue"
                style={{marginBottom: "0.5rem"}}
              >
                <IconUserPlus size={32} />
              </ThemeIcon>
              <Title order={1} fw={800} size="2.5rem">
                Create Your Account
              </Title>
              <Text c="dimmed" size="lg" maw={400}>
                Join Digital Mailroom and start managing your mail online
              </Text>
            </Stack>

            <Paper
              withBorder
              shadow="xl"
              p="xl"
              radius="lg"
              style={{
                backgroundColor: "var(--mantine-color-white)",
              }}
            >
              {showConfirmation ? (
                <Stack gap="lg" align="center" ta="center">
                  <ThemeIcon
                    size={80}
                    radius="xl"
                    variant="light"
                    color="green"
                  >
                    <IconMailCheck size={40} />
                  </ThemeIcon>
                  <Stack gap="xs" align="center">
                    <Title order={2} fw={700} size="h3">
                      Check Your Email
                    </Title>
                    <Text c="dimmed" size="md" maw={400}>
                      We&apos;ve sent a confirmation link to{" "}
                      <Text component="span" fw={600} c="blue">
                        {email}
                      </Text>
                    </Text>
                  </Stack>
                  <Alert
                    icon={<IconMail size={18} />}
                    title="Email Confirmation Required"
                    color="blue"
                    variant="light"
                    style={{width: "100%"}}
                  >
                    Please check your email and click the confirmation link to
                    activate your account. The link will expire in 1 hour.
                  </Alert>
                  <Stack gap="sm" style={{width: "100%"}}>
                    <Text size="sm" c="dimmed" ta="center">
                      Didn&apos;t receive the email? Check your spam folder or
                    </Text>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        setShowConfirmation(false);
                        setEmail("");
                      }}
                    >
                      Try Another Email
                    </Button>
                    <Button
                      component={Link}
                      href="/login"
                      variant="subtle"
                      fullWidth
                    >
                      Back to Login
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <>
                  <form onSubmit={handleSubmit}>
                    <Stack gap="lg">
                      <TextInput
                        label="Email Address"
                        placeholder="you@example.com"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={signupPending}
                        size="md"
                        leftSection={<IconMail size={18} />}
                        styles={{
                          label: {fontWeight: 600, marginBottom: "0.5rem"},
                        }}
                      />

                      <Box>
                        <PasswordInput
                          label="Password"
                          placeholder="Create a strong password"
                          name="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={signupPending}
                          size="md"
                          leftSection={<IconLock size={18} />}
                          styles={{
                            label: {fontWeight: 600, marginBottom: "0.5rem"},
                          }}
                        />
                        {password && (
                          <Box mt="sm">
                            <PasswordStrengthIndicator password={password} />
                          </Box>
                        )}
                      </Box>

                      <PasswordInput
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        name="confirmPassword"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={signupPending}
                        size="md"
                        leftSection={<IconLock size={18} />}
                        error={
                          confirmPassword.length > 0 && !passwordsMatch
                            ? "Passwords do not match"
                            : null
                        }
                        styles={{
                          label: {fontWeight: 600, marginBottom: "0.5rem"},
                        }}
                      />

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={signupPending}
                        disabled={signupPending || !isFormValid}
                        leftSection={
                          !signupPending && <IconUserPlus size={18} />
                        }
                        style={{
                          marginTop: "0.5rem",
                        }}
                      >
                        {signupPending
                          ? "Creating account..."
                          : "Create Account"}
                      </Button>
                    </Stack>
                  </form>

                  <Divider my="lg" label="OR" labelPosition="center" />

                  <Text c="dimmed" size="sm" ta="center">
                    Already have an account?{" "}
                    <Anchor component={Link} href="/login" size="sm" fw={600}>
                      Sign in
                    </Anchor>
                  </Text>
                </>
              )}
            </Paper>

            <Text c="dimmed" size="xs" ta="center">
              By creating an account, you agree to our{" "}
              <Anchor href="#" size="xs" fw={500}>
                Terms of Service
              </Anchor>{" "}
              and{" "}
              <Anchor href="#" size="xs" fw={500}>
                Privacy Policy
              </Anchor>
            </Text>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
