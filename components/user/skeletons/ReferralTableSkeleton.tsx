"use client";

import {Table, Skeleton} from "@mantine/core";

interface ReferralTableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function ReferralTableSkeleton({
  rows = 3,
  columns = 5,
}: ReferralTableSkeletonProps) {
  return (
    <Table.ScrollContainer minWidth={600}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {Array.from({length: columns}).map((_, i) => (
              <Table.Th key={i}>
                <Skeleton height={20} width={80} radius="md" />
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {Array.from({length: rows}).map((_, row) => (
            <Table.Tr key={row}>
              {Array.from({length: columns}).map((_, cell) => (
                <Table.Td key={cell}>
                  <Skeleton height={20} width="80%" radius="md" />
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

