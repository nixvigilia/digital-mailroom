"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {
  Group,
  TextInput,
  Select,
  Badge,
  Paper,
  Stack,
  ActionIcon,
} from "@mantine/core";
import {IconSearch, IconFilter, IconTag} from "@tabler/icons-react";
import {useRef} from "react";
import {useHotkeys} from "@mantine/hooks";

interface InboxFiltersProps {
  allTags: string[];
}

export function InboxFilters({allTags}: InboxFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";
  const tagFilter = searchParams.get("tag") || "";

  // Focus search input when Ctrl+K is pressed
  useHotkeys([
    [
      "mod+K",
      () => {
        searchInputRef.current?.focus();
      },
    ],
  ]);

  const updateSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change
    params.delete("page");
    router.push(`/app/inbox?${params.toString()}`);
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <TextInput
            ref={searchInputRef}
            placeholder="Search mail..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => updateSearchParam("search", e.target.value)}
            size="md"
            style={{flex: 1, minWidth: 200}}
          />
          <Select
            placeholder="Filter by status"
            leftSection={<IconFilter size={16} />}
            value={statusFilter}
            onChange={(value) => updateSearchParam("status", value || "all")}
            data={[
              {value: "all", label: "All Status"},
              {value: "received", label: "Received"},
              {value: "scanned", label: "Scanned"},
              {value: "processed", label: "Processed"},
              {value: "archived", label: "Archived"},
            ]}
            size="md"
            style={{minWidth: 160}}
          />
          {allTags.length > 0 && (
            <Select
              placeholder="Filter by tag"
              leftSection={<IconTag size={16} />}
              value={tagFilter}
              onChange={(value) => updateSearchParam("tag", value || "")}
              data={[
                {value: "", label: "All Tags"},
                ...allTags.map((tag) => ({value: tag, label: tag})),
              ]}
              clearable
              size="md"
              style={{minWidth: 160}}
            />
          )}
        </Group>
        {(searchQuery || statusFilter !== "all" || tagFilter) && (
          <Group gap="xs">
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--mantine-color-dimmed)",
              }}
            >
              Active filters:
            </span>
            {searchQuery && (
              <Badge
                variant="light"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                    onClick={() => updateSearchParam("search", "")}
                    style={{cursor: "pointer"}}
                  >
                    ×
                  </ActionIcon>
                }
              >
                Search: {searchQuery}
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge
                variant="light"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                    onClick={() => updateSearchParam("status", "all")}
                    style={{cursor: "pointer"}}
                  >
                    ×
                  </ActionIcon>
                }
              >
                Status: {statusFilter}
              </Badge>
            )}
            {tagFilter && tagFilter !== "" && (
              <Badge
                variant="light"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                    onClick={() => updateSearchParam("tag", "")}
                    style={{cursor: "pointer"}}
                  >
                    ×
                  </ActionIcon>
                }
              >
                Tag: {tagFilter}
              </Badge>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
