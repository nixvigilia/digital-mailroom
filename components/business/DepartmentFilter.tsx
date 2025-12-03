"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {Paper, Stack, Group, Text, Select} from "@mantine/core";

interface DepartmentFilterProps {
  currentDepartment: string;
  departments: Array<{value: string; label: string}>;
  departmentCounts: Record<string, number>;
}

export function DepartmentFilter({
  currentDepartment,
  departments,
  departmentCounts,
}: DepartmentFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateDepartment = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("department", value);
    } else {
      params.delete("department");
    }
    params.delete("page"); // Reset to page 1
    router.push(`/business/inbox?${params.toString()}`);
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Group gap="md" align="center">
          <Text size="sm" fw={600} c="dimmed">
            Filter by Department:
          </Text>
          <Select
            value={currentDepartment}
            data={departments.map((dept) => ({
              value: dept.value,
              label: `${dept.label} (${departmentCounts[dept.value] || 0})`,
            }))}
            onChange={updateDepartment}
            style={{flex: 1, maxWidth: 300}}
          />
        </Group>
      </Stack>
    </Paper>
  );
}


