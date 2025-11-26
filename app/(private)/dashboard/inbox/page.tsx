"use client";

import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {useRouter} from "next/navigation";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Button,
  Group,
  Box,
  Loader,
  Center,
} from "@mantine/core";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import {signOut} from "@/app/actions/auth";
import {IconMail, IconLogout} from "@tabler/icons-react";

export default function InboxPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: {user},
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  if (loading) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <Center style={{flex: 1}}>
          <Loader size="lg" />
        </Center>
        <Footer />
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <Container size="lg" py={40} style={{flex: 1}}>
        <Stack gap="xl">
          <Group justify="space-between" align="center">
            <Stack gap="xs">
              <Title order={1} fw={800} size="2.5rem">
                Inbox
              </Title>
              <Text c="dimmed" size="lg">
                Welcome back, {user?.email}
              </Text>
            </Stack>
          </Group>

          <Paper withBorder shadow="sm" p="xl" radius="md">
            <Stack gap="md">
              <Group gap="sm">
                <IconMail size={24} />
                <Title order={2} size="h3">
                  Your Mail
                </Title>
              </Group>
              <Text c="dimmed">
                Your mail items will appear here once you start receiving mail
                at your Digital Mailroom address.
              </Text>
              <Text size="sm" c="dimmed">
                Account Status:{" "}
                <Text component="span" fw={600} c="green">
                  Active
                </Text>
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
}
