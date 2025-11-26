"use client";

import {Suspense} from "react";
import {Container, Title, Text, Button, Stack, Alert, Box} from "@mantine/core";
import {IconAlertCircle, IconHome} from "@tabler/icons-react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";

function ErrorContent() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") || "An unexpected error occurred.";

  return (
    <Box>
      <Header />
      <Container size="lg" py={100}>
        <Stack gap="xl" align="center" style={{textAlign: "center"}}>
          <Alert
            icon={<IconAlertCircle size={20} />}
            title="Error"
            color="red"
            variant="light"
            style={{maxWidth: 600}}
          >
            {message}
          </Alert>
          <Title order={1} size="2.5rem" fw={700} c="gray.9">
            Something went wrong
          </Title>
          <Text size="lg" c="dimmed" maw={600}>
            We encountered an error processing your request. Please try again or
            contact support if the problem persists.
          </Text>
          <Button
            component={Link}
            href="/"
            size="lg"
            variant="filled"
            color="blue"
            leftSection={<IconHome size={20} />}
          >
            Go to Homepage
          </Button>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <Box>
          <Header />
          <Container size="lg" py={100}>
            <Stack gap="xl" align="center" style={{textAlign: "center"}}>
              <Title order={1} size="2.5rem" fw={700} c="gray.9">
                Loading...
              </Title>
            </Stack>
          </Container>
          <Footer />
        </Box>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
