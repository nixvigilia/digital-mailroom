"use client";

import {useState} from "react";
import {
  TextInput,
  Button,
  Modal,
  Text,
  Stack,
  Anchor,
  Alert,
} from "@mantine/core";
import {IconInfoCircle} from "@tabler/icons-react";
import {getPasswordHint} from "@/app/actions/auth-hint";

export function PasswordHintModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetHint = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    setHint(null);

    const result = await getPasswordHint(email);
    if (result.success && result.hint) {
      setHint(result.hint);
    } else {
      setError(result.message || "No hint found.");
    }
    setLoading(false);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Password Hint">
      <Stack>
        <Text size="sm" c="dimmed">
          Enter your email address to retrieve your password hint.
        </Text>
        <TextInput
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {hint && (
          <Alert
            color="blue"
            icon={<IconInfoCircle size={16} />}
            title="Your Hint"
          >
            {hint}
          </Alert>
        )}
        {error && (
          <Alert color="red" icon={<IconInfoCircle size={16} />}>
            {error}
          </Alert>
        )}
        <Button onClick={handleGetHint} loading={loading} disabled={!email}>
          Get Hint
        </Button>
      </Stack>
    </Modal>
  );
}



