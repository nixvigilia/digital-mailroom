"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {SegmentedControl} from "@mantine/core";
import {IconInbox, IconArchive} from "@tabler/icons-react";

export function BusinessInboxViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const viewMode = searchParams.get("view") || "inbox";

  const handleViewChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "inbox") {
      params.delete("view");
    } else {
      params.set("view", value);
    }
    params.delete("page"); // Reset to page 1
    router.push(`/business/inbox?${params.toString()}`);
  };

  return (
    <SegmentedControl
      value={viewMode}
      onChange={handleViewChange}
      data={[
        {
          value: "inbox",
          label: (
            <span style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
              <IconInbox size={16} />
              Inbox
            </span>
          ),
        },
        {
          value: "archived",
          label: (
            <span style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
              <IconArchive size={16} />
              Archived
            </span>
          ),
        },
      ]}
    />
  );
}

