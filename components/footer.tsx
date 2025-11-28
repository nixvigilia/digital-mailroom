"use client";

import {
  Box,
  Container,
  Grid,
  Stack,
  Title,
  Text,
  Group,
  Anchor,
  Divider,
} from "@mantine/core";
import {
  IconMapPin,
  IconPhone,
  IconMail as IconEmail,
} from "@tabler/icons-react";

export function Footer() {
  return (
    <Box bg="gray.9" style={{color: "white"}} py={60} id="contact">
      <Container size="lg">
        <Grid>
          <Grid.Col span={{base: 12, md: 6}}>
            <Stack gap="md">
              <Title order={4} size="h4" fw={600} c="white">
                Our Location
              </Title>
              <Group gap="sm" c="gray.4">
                <IconMapPin size={20} />
                <Text c="gray.4">
                  Keep PH - Digital Mailbox
                  <br />
                  Secure Mail Processing Facility
                </Text>
              </Group>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{base: 12, md: 6}}>
            <Stack gap="md">
              <Title order={4} size="h4" fw={600} c="white">
                Contact Us
              </Title>
              <Group gap="sm" c="gray.4">
                <IconEmail size={20} />
                <Anchor href="mailto:admin@digitalmailroom.com" c="gray.4">
                  admin@digitalmailroom.com
                </Anchor>
              </Group>
              <Group gap="sm" c="gray.4">
                <IconPhone size={20} />
                <Anchor href="tel:+1234567890" c="gray.4">
                  +1 (234) 567-890
                </Anchor>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
        <Divider my="xl" color="gray.7" />
        <Group justify="space-between" align="center">
          <Text size="sm" c="gray.5">
            © 2025 Keep PH - Digital Mailbox. All rights reserved.
          </Text>
          <Group gap="md">
            <Anchor href="#" c="gray.5" size="sm">
              Terms of Use
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
