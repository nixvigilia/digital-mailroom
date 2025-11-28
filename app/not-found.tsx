"use client";

import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {IconMail, IconHome, IconArrowLeft} from "@tabler/icons-react";
import Link from "next/link";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";

export default function NotFound() {
  return (
    <Box>
      <Header />
      <Container size="lg" py={100}>
        <Stack gap="xl" align="center" style={{textAlign: "center"}}>
          <ThemeIcon
            size={120}
            radius="xl"
            variant="light"
            color="blue"
            style={{margin: "0 auto"}}
          >
            <IconMail size={60} />
          </ThemeIcon>
          <Title
            order={1}
            size="4rem"
            fw={800}
            style={{lineHeight: 1.2}}
            c="gray.9"
          >
            404
          </Title>
          <Title
            order={2}
            size="2rem"
            fw={600}
            style={{lineHeight: 1.2}}
            c="gray.7"
          >
            Page Not Found
          </Title>
          <Text size="lg" c="dimmed" maw={600}>
            Oops! The page you're looking for seems to have been lost in the
            mail. It might have been moved, deleted, or never existed.
          </Text>
          <Stack gap="md" mt="xl">
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
            <Button
              component={Link}
              href="/"
              size="md"
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={18} />}
            >
              Go Back
            </Button>
          </Stack>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
}




