"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {Group, Pagination} from "@mantine/core";

interface BusinessInboxPaginationProps {
  totalPages: number;
  currentPage: number;
}

export function BusinessInboxPagination({
  totalPages,
  currentPage,
}: BusinessInboxPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`/business/inbox?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Group justify="center" mt="xl">
      <Pagination
        total={totalPages}
        value={currentPage}
        onChange={handlePageChange}
        size="md"
        radius="md"
      />
    </Group>
  );
}

