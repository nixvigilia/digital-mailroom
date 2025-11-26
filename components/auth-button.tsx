"use client";

import {Button, Group} from "@mantine/core";
import {createClient} from "@/utils/supabase/client";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import Link from "next/link";
import {signOut} from "@/app/actions/auth";

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <Group gap="sm">
        <Button component={Link} href="/dashboard/inbox" variant="subtle">
          Dashboard
        </Button>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign Out
          </Button>
        </form>
      </Group>
    );
  }

  return (
    <Group gap="sm">
      <Button component={Link} href="/login" variant="subtle">
        Login
      </Button>
      <Button component={Link} href="/signup" variant="filled" color="blue">
        Join the Waitlist
      </Button>
    </Group>
  );
}
