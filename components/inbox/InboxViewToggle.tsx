"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {SegmentedControl} from "@mantine/core";

export function InboxViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("view") || "inbox";

  const handleViewChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", value);
    params.delete("page"); // Reset to page 1
    router.push(`/app/dashboard?${params.toString()}`);
  };

  return (
    <>
      <SegmentedControl
        value={viewMode}
        onChange={handleViewChange}
        data={[
          {label: "Inbox", value: "inbox"},
          {label: "Archived", value: "archived"},
        ]}
        size="sm"
        visibleFrom="sm"
      />
      <SegmentedControl
        value={viewMode}
        onChange={handleViewChange}
        data={[
          {label: "Inbox", value: "inbox"},
          {label: "Archived", value: "archived"},
        ]}
        size="xs"
        hiddenFrom="sm"
      />
    </>
  );
}
