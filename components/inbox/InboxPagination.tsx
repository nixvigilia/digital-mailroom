"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {Group, Pagination} from "@mantine/core";

interface InboxPaginationProps {
  totalPages: number;
  currentPage: number;
}

export function InboxPagination({
  totalPages,
  currentPage,
}: InboxPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/app/dashboard?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <Group justify="center" mt="xl">
      <Pagination
        total={totalPages}
        value={currentPage}
        onChange={handlePageChange}
        size="sm"
        radius="md"
        withEdges
      />
    </Group>
  );
}
