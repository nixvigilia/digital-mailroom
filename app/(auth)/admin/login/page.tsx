"use client";

import {useActionState, useEffect} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {adminLogin, type ActionResult} from "@/app/actions/admin-auth";
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
} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {
  IconCheck,
  IconAlertCircle,
  IconLock,
  IconMail,
  IconShieldLock,
} from "@tabler/icons-react";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginState, loginAction, loginPending] = useActionState<
    ActionResult | null,
    FormData
  >(adminLogin, null);

  useEffect(() => {
    if (loginState) {
      if (loginState.success) {
        notifications.show({
          title: "Success",
          message: loginState.message,
          color: "green",
          icon: <IconCheck size={18} />,
        });
        // Redirect based on role
        router.push(loginState.redirectTo || "/admin");
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
                color="red"
                style={{marginBottom: "0.5rem"}}
              >
                <IconShieldLock size={32} />
              </ThemeIcon>
              <Title order={1} fw={800} size="2.5rem">
                Admin Portal
              </Title>
              <Text c="dimmed" size="lg" maw={400}>
                Secure access for system administrators
              </Text>
            </Stack>

            <Paper
              withBorder
              shadow="xl"
              p="xl"
              radius="lg"
              style={{
                backgroundColor: "var(--mantine-color-white)",
                borderColor: "var(--mantine-color-red-2)",
              }}
            >
              <form action={loginAction}>
                <Stack gap="lg">
                  <TextInput
                    label="Admin Email"
                    placeholder="admin@scic.com"
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
                    placeholder="Enter admin password"
                    name="password"
                    required
                    disabled={loginPending}
                    size="md"
                    leftSection={<IconLock size={18} />}
                    styles={{
                      label: {fontWeight: 600, marginBottom: "0.5rem"},
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={loginPending}
                    disabled={loginPending}
                    color="red"
                    leftSection={!loginPending && <IconShieldLock size={18} />}
                    style={{
                      marginTop: "0.5rem",
                    }}
                  >
                    {loginPending
                      ? "Verifying Access..."
                      : "Access Admin Portal"}
                  </Button>
                </Stack>
              </form>

              <Stack gap="xs" align="center" mt="xl">
                <Anchor component={Link} href="/login" size="sm" c="dimmed">
                  Return to User Login
                </Anchor>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
