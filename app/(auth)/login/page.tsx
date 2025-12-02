"use client";

import {useActionState, useEffect} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {login, type ActionResult} from "../../actions/auth";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Anchor,
  Box,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {
  IconCheck,
  IconAlertCircle,
  IconLock,
  IconMail,
  IconLogin,
} from "@tabler/icons-react";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";

export default function LoginPage() {
  const router = useRouter();
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
        // Redirect to user dashboard
        router.push("/app");
      } else {
        notifications.show({
          title: "Error",
          message: loginState.message,
          color: "red",
          icon: <IconAlertCircle size={18} />,
        });
      }
    }
  }, [loginState, router]);

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
                <IconLogin size={32} />
              </ThemeIcon>
              <Title order={1} fw={800} size="2.5rem">
                Welcome Back
              </Title>
              <Text c="dimmed" size="lg" maw={400}>
                Sign in to your account to access your digital mailroom
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
              <form action={loginAction}>
                <Stack gap="lg">
                  <TextInput
                    label="Email Address"
                    placeholder="you@example.com"
                    name="email"
                    type="email"
                    required
                    disabled={loginPending}
                    size="md"
                    leftSection={<IconMail size={18} />}
                    styles={{
                      label: {fontWeight: 600, marginBottom: "0.5rem"},
                    }}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    name="password"
                    required
                    disabled={loginPending}
                    size="md"
                    leftSection={<IconLock size={18} />}
                    styles={{
                      label: {fontWeight: 600, marginBottom: "0.5rem"},
                    }}
                  />

                  <Box>
                    <Anchor
                      component={Link}
                      href="/forgot-password"
                      size="sm"
                      style={{float: "right"}}
                    >
                      Forgot password?
                    </Anchor>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={loginPending}
                    disabled={loginPending}
                    leftSection={!loginPending && <IconLogin size={18} />}
                    style={{
                      marginTop: "0.5rem",
                    }}
                  >
                    {loginPending ? "Signing in..." : "Sign In"}
                  </Button>
                </Stack>
              </form>

              <Divider my="lg" label="OR" labelPosition="center" />

              <Text c="dimmed" size="sm" ta="center">
                Don&apos;t have an account?{" "}
                <Anchor component={Link} href="/signup" size="sm" fw={600}>
                  Sign up
                </Anchor>
              </Text>
            </Paper>

            <Text c="dimmed" size="xs" ta="center">
              By signing in, you agree to our{" "}
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
