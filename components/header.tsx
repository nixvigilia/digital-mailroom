"use client";

import {Box, Container, Group, Title, Anchor} from "@mantine/core";
import Link from "next/link";
import {AuthButton} from "./auth-button";

export function Header() {
  return (
    <Box
      style={{
        borderBottom: "1px solid var(--mantine-color-gray-3)",
        padding: "1rem 0",
      }}
    >
      <Container size="lg">
        <Group justify="space-between" align="center">
          <Link href="/" style={{textDecoration: "none", color: "inherit"}}>
            <Title order={2} size="h3" fw={700}>
              Digital Mailroom
            </Title>
          </Link>
          <Group gap="lg">
            <Anchor href="/#pricing" c="dark" fw={500}>
              Pricing
            </Anchor>
            <Anchor href="/#contact" c="dark" fw={500}>
              Contact Us
            </Anchor>
            <AuthButton />
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
