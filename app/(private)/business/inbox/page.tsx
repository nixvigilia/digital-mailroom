import {Suspense} from "react";
import {Title, Text, Stack, Group, Paper, SimpleGrid, Badge, Select} from "@mantine/core";
import {IconInbox, IconBuilding} from "@tabler/icons-react";
import {MailItemCard, MailItem} from "@/components/mail/MailItemCard";
import {BusinessInboxFilters} from "@/components/business/BusinessInboxFilters";
import {BusinessInboxViewToggle} from "@/components/business/BusinessInboxViewToggle";
import {BusinessInboxPagination} from "@/components/business/BusinessInboxPagination";
import {DepartmentFilter} from "@/components/business/DepartmentFilter";
import {getCurrentUser} from "@/utils/supabase/dal";
import {redirect} from "next/navigation";

// Mock data - will be replaced with backend integration
const mockMailItems: MailItem[] = [
  {
    id: "1",
    receivedAt: new Date("2025-01-15T10:30:00"),
    sender: "BIR - Bureau of Internal Revenue",
    subject: "Tax Assessment Notice",
    status: "received",
    hasFullScan: false,
    tags: ["Tax", "Finance", "Important"],
    department: "Finance",
    assignedTo: "John Doe",
  },
  {
    id: "2",
    receivedAt: new Date("2025-01-14T14:20:00"),
    sender: "SSS - Social Security System",
    subject: "Employee Contribution Statement",
    status: "scanned",
    hasFullScan: true,
    tags: ["HR", "Benefits"],
    department: "Human Resources",
    assignedTo: "Jane Smith",
  },
  {
    id: "3",
    receivedAt: new Date("2025-01-13T09:15:00"),
    sender: "Philippine Contractors Association",
    subject: "Legal Notice - Contract Review",
    status: "processed",
    hasFullScan: true,
    tags: ["Legal", "Contracts"],
    department: "Legal",
    assignedTo: "Mike Johnson",
  },
  {
    id: "4",
    receivedAt: new Date("2025-01-12T16:45:00"),
    sender: "Metrobank Corporate",
    subject: "Business Account Statement",
    status: "received",
    hasFullScan: false,
    tags: ["Finance", "Banking"],
    department: "Finance",
    assignedTo: null,
  },
  {
    id: "5",
    receivedAt: new Date("2025-01-11T11:20:00"),
    sender: "Department of Labor and Employment",
    subject: "Labor Compliance Certificate",
    status: "scanned",
    hasFullScan: true,
    tags: ["HR", "Compliance"],
    department: "Human Resources",
    assignedTo: "Jane Smith",
  },
  {
    id: "6",
    receivedAt: new Date("2025-01-10T08:30:00"),
    sender: "Philippine Economic Zone Authority",
    subject: "PEZA Registration Renewal",
    status: "received",
    hasFullScan: false,
    tags: ["Operations", "Compliance"],
    department: "Operations",
    assignedTo: null,
  },
  {
    id: "7",
    receivedAt: new Date("2025-01-09T13:15:00"),
    sender: "Securities and Exchange Commission",
    subject: "Annual Report Filing Reminder",
    status: "processed",
    hasFullScan: true,
    tags: ["Legal", "Compliance", "Important"],
    department: "Legal",
    assignedTo: "Mike Johnson",
  },
  {
    id: "8",
    receivedAt: new Date("2025-01-08T15:00:00"),
    sender: "Bureau of Customs",
    subject: "Import Documentation",
    status: "scanned",
    hasFullScan: true,
    tags: ["Operations", "Shipping"],
    department: "Operations",
    assignedTo: "Sarah Lee",
  },
  {
    id: "9",
    receivedAt: new Date("2025-01-07T09:45:00"),
    sender: "Philippine Health Insurance Corporation",
    subject: "PhilHealth Contribution Notice",
    status: "received",
    hasFullScan: false,
    tags: ["HR", "Benefits"],
    department: "Human Resources",
    assignedTo: null,
  },
  {
    id: "10",
    receivedAt: new Date("2025-01-06T12:30:00"),
    sender: "Pag-IBIG Fund",
    subject: "Housing Loan Application",
    status: "scanned",
    hasFullScan: true,
    tags: ["HR", "Benefits"],
    department: "Human Resources",
    assignedTo: "Jane Smith",
  },
];

interface InboxPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    tag?: string;
    view?: string;
    page?: string;
    department?: string;
  }>;
}

async function getMailItems(userId: string, department?: string): Promise<MailItem[]> {
  // TODO: Replace with actual database query
  // For now, return mock data filtered by department
  let items = mockMailItems;
  if (department && department !== "all") {
    items = items.filter((item) => item.department?.toLowerCase() === department.toLowerCase());
  }
  return items;
}

// Mock departments - will be replaced with backend
const departments = [
  {value: "all", label: "All Departments"},
  {value: "finance", label: "Finance"},
  {value: "hr", label: "Human Resources"},
  {value: "legal", label: "Legal"},
  {value: "operations", label: "Operations"},
  {value: "general", label: "General"},
];

export default async function BusinessInboxPage({searchParams}: InboxPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const userId = currentUser.userId;

  // Await searchParams if it's a Promise (Next.js 15)
  const params = await searchParams;

  // Get filters from URL search params
  const searchQuery = params.search || "";
  const statusFilter = params.status || "all";
  const tagFilter = params.tag || "";
  const viewMode = (params.view as "inbox" | "archived") || "inbox";
  const departmentFilter = params.department || "all";
  const currentPage = parseInt(params.page || "1", 10);
  const itemsPerPage = 12;

  // Fetch mail items
  const mailItems = await getMailItems(userId, departmentFilter);

  // Filter items
  const filteredItems = mailItems.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (
      searchQuery &&
      !item.sender?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (tagFilter && tagFilter !== "" && !item.tags?.includes(tagFilter))
      return false;
    if (viewMode === "archived" && item.status !== "archived") return false;
    if (viewMode === "inbox" && item.status === "archived") return false;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Get all unique tags
  const allTags = Array.from(
    new Set(mailItems.flatMap((item) => item.tags || []))
  );

  // Get department counts
  const departmentCounts = departments.reduce((acc, dept) => {
    if (dept.value === "all") {
      acc[dept.value] = mailItems.length;
    } else {
      acc[dept.value] = mailItems.filter(
        (item) => item.department?.toLowerCase() === dept.value.toLowerCase()
      ).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={4}>
            <Group gap="md" align="center">
              <IconBuilding size={32} color="var(--mantine-color-blue-6)" />
              <Title
                order={1}
                fw={800}
                style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
              >
                {viewMode === "inbox" ? "Shared Inbox" : "Archived"}
              </Title>
            </Group>
            <Text c="dimmed" size="lg" visibleFrom="sm">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
              {departmentFilter !== "all" && ` in ${departments.find((d) => d.value === departmentFilter)?.label}`}
            </Text>
            <Text c="dimmed" size="sm" hiddenFrom="sm">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </Text>
          </Stack>
          <Suspense fallback={<div />}>
            <BusinessInboxViewToggle />
          </Suspense>
        </Group>
      </Stack>

      {/* Department Filter - Client Component */}
      <Suspense fallback={<div />}>
        <DepartmentFilter
          currentDepartment={departmentFilter}
          departments={departments}
          departmentCounts={departmentCounts}
        />
      </Suspense>

      {/* Filters */}
      <Suspense
        fallback={
          <Paper withBorder p="md" radius="md">
            Loading filters...
          </Paper>
        }
      >
        <BusinessInboxFilters allTags={allTags} />
      </Suspense>

      {/* Mail Items List */}
      {filteredItems.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Stack gap="md" align="center">
            <IconInbox size={48} color="var(--mantine-color-gray-5)" />
            <Text size="lg" c="dimmed" ta="center">
              {viewMode === "inbox"
                ? "No mail items found. Your team mail will appear here once received."
                : "No archived items."}
            </Text>
          </Stack>
        </Paper>
      ) : (
        <>
          <SimpleGrid
            cols={{base: 1, sm: 2, md: 3, lg: 4}}
            spacing={{base: "md", sm: "lg", md: "xl"}}
          >
            {paginatedItems.map((item) => (
              <MailItemCard key={item.id} item={item} />
            ))}
          </SimpleGrid>

          {/* Pagination */}
          <Suspense fallback={<div />}>
            <BusinessInboxPagination
              totalPages={totalPages}
              currentPage={currentPage}
            />
          </Suspense>
        </>
      )}
    </Stack>
  );
}

