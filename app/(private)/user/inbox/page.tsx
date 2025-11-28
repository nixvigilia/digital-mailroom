import {Suspense} from "react";
import {Title, Text, Stack, Group, Paper, SimpleGrid} from "@mantine/core";
import {IconInbox} from "@tabler/icons-react";
import {MailItemCard, MailItem} from "@/components/mail/MailItemCard";
import {InboxFilters} from "@/components/inbox/InboxFilters";
import {InboxViewToggle} from "@/components/inbox/InboxViewToggle";
import {InboxPagination} from "@/components/inbox/InboxPagination";
import {WelcomeContent} from "@/components/user/WelcomeContent";
import {getCurrentUser, getKYCStatus} from "@/utils/supabase/dal";
import {redirect} from "next/navigation";

// Mock data - will be replaced with backend integration
const mockMailItems: MailItem[] = [
  {
    id: "1",
    receivedAt: new Date("2025-01-15T10:30:00"),
    sender: "BDO Unibank",
    subject: "Monthly Statement",
    status: "received",
    hasFullScan: false,
    tags: ["Bills", "Financial"],
  },
  {
    id: "2",
    receivedAt: new Date("2025-01-14T14:20:00"),
    sender: "Lazada Philippines",
    subject: "Package Delivery Notice",
    status: "scanned",
    hasFullScan: true,
    tags: ["Shopping"],
  },
  {
    id: "3",
    receivedAt: new Date("2025-01-13T09:15:00"),
    sender: "Bureau of Internal Revenue (BIR)",
    subject: "Tax Document",
    status: "processed",
    hasFullScan: true,
    tags: ["Tax", "Important"],
  },
  {
    id: "4",
    receivedAt: new Date("2025-01-12T16:45:00"),
    sender: "Metrobank",
    subject: "Credit Card Statement",
    status: "received",
    hasFullScan: false,
    tags: ["Bills", "Financial"],
  },
  {
    id: "5",
    receivedAt: new Date("2025-01-11T11:20:00"),
    sender: "LBC Express",
    subject: "Package Tracking Update",
    status: "scanned",
    hasFullScan: true,
    tags: ["Shipping"],
  },
  {
    id: "6",
    receivedAt: new Date("2025-01-10T08:30:00"),
    sender: "PLDT",
    subject: "Monthly Bill",
    status: "received",
    hasFullScan: false,
    tags: ["Bills", "Utilities"],
  },
  {
    id: "7",
    receivedAt: new Date("2025-01-09T13:15:00"),
    sender: "GCash",
    subject: "Account Statement",
    status: "processed",
    hasFullScan: true,
    tags: ["Financial", "Digital"],
  },
  {
    id: "8",
    receivedAt: new Date("2025-01-08T15:00:00"),
    sender: "Shopee Philippines",
    subject: "Order Confirmation",
    status: "scanned",
    hasFullScan: true,
    tags: ["Shopping", "Electronics"],
  },
  {
    id: "9",
    receivedAt: new Date("2025-01-07T09:45:00"),
    sender: "Philippine Prudential Life Insurance",
    subject: "Policy Renewal Notice",
    status: "received",
    hasFullScan: false,
    tags: ["Insurance", "Important"],
  },
  {
    id: "10",
    receivedAt: new Date("2025-01-06T12:30:00"),
    sender: "2GO Express",
    subject: "Delivery Attempted",
    status: "scanned",
    hasFullScan: true,
    tags: ["Shipping"],
  },
  {
    id: "11",
    receivedAt: new Date("2025-01-05T14:20:00"),
    sender: "BPI Credit Card",
    subject: "Credit Card Statement",
    status: "processed",
    hasFullScan: true,
    tags: ["Bills", "Financial"],
  },
  {
    id: "12",
    receivedAt: new Date("2025-01-04T10:10:00"),
    sender: "Globe Telecom",
    subject: "Service Update",
    status: "received",
    hasFullScan: false,
    tags: ["Utilities", "Telecom"],
  },
  {
    id: "13",
    receivedAt: new Date("2025-01-03T16:00:00"),
    sender: "Security Bank",
    subject: "Account Activity Alert",
    status: "scanned",
    hasFullScan: true,
    tags: ["Financial", "Important"],
  },
  {
    id: "14",
    receivedAt: new Date("2025-01-02T11:30:00"),
    sender: "SM Department Store",
    subject: "Order Shipped",
    status: "processed",
    hasFullScan: true,
    tags: ["Shopping"],
  },
  {
    id: "15",
    receivedAt: new Date("2025-01-01T08:15:00"),
    sender: "Social Security System (SSS)",
    subject: "Benefits Statement",
    status: "received",
    hasFullScan: false,
    tags: ["Government", "Important"],
  },
  {
    id: "16",
    receivedAt: new Date("2024-12-31T13:45:00"),
    sender: "Octagon Computer Superstore",
    subject: "Receipt - Order #123456",
    status: "scanned",
    hasFullScan: true,
    tags: ["Shopping", "Electronics"],
  },
  {
    id: "17",
    receivedAt: new Date("2024-12-30T10:20:00"),
    sender: "Converge ICT",
    subject: "Internet Service Bill",
    status: "processed",
    hasFullScan: true,
    tags: ["Bills", "Utilities"],
  },
  {
    id: "18",
    receivedAt: new Date("2024-12-29T15:30:00"),
    sender: "RCBC Bank",
    subject: "Year-End Summary",
    status: "received",
    hasFullScan: false,
    tags: ["Financial", "Important"],
  },
  {
    id: "19",
    receivedAt: new Date("2024-12-28T09:00:00"),
    sender: "J&T Express",
    subject: "Package Delivered",
    status: "scanned",
    hasFullScan: true,
    tags: ["Shipping"],
  },
  {
    id: "20",
    receivedAt: new Date("2024-12-27T14:15:00"),
    sender: "Ace Hardware Philippines",
    subject: "Purchase Receipt",
    status: "processed",
    hasFullScan: true,
    tags: ["Shopping", "Home"],
  },
];

interface InboxPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    tag?: string;
    view?: string;
    page?: string;
  }>;
}

async function getMailItems(userId: string): Promise<MailItem[]> {
  // TODO: Replace with actual database query
  // For now, return mock data
  // const mailItems = await prisma.mailItem.findMany({
  //   where: { user_id: userId },
  //   orderBy: { received_at: 'desc' },
  // });
  return mockMailItems;
}

export default async function InboxPage({searchParams}: InboxPageProps) {
  // Middleware already handles authentication, so we can use getCurrentUser
  // which doesn't redirect (middleware already protects this route)
  const currentUser = await getCurrentUser();

  // This should never be null since middleware protects /user routes
  if (!currentUser) {
    redirect("/login");
  }

  const userId = currentUser.userId;

  // Check KYC status
  const kycStatus = await getKYCStatus(userId);

  // Redirect to KYC page if PENDING or REJECTED
  // if (kycStatus === "PENDING" || kycStatus === "REJECTED") {
  //   redirect("/user/kyc");
  // }

  // Show welcome content if KYC not started
  // if (kycStatus === "NOT_STARTED") {
  //   return (
  //     <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
  //       <WelcomeContent />
  //     </Stack>
  //   );
  // }

  // Await searchParams if it's a Promise (Next.js 15)
  const params = await searchParams;

  // Get filters from URL search params
  const searchQuery = params.search || "";
  const statusFilter = params.status || "all";
  const tagFilter = params.tag || "";
  const viewMode = (params.view as "inbox" | "archived") || "inbox";
  const currentPage = parseInt(params.page || "1", 10);
  const itemsPerPage = 12;

  // Fetch mail items
  const mailItems = await getMailItems(userId);

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

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={4}>
            <Title
              order={1}
              fw={800}
              style={{fontSize: "clamp(1.5rem, 4vw, 2.5rem)"}}
            >
              {viewMode === "inbox" ? "Inbox" : "Archived"}
            </Title>
            <Text c="dimmed" size="lg" visibleFrom="sm">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </Text>
            <Text c="dimmed" size="sm" hiddenFrom="sm">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </Text>
          </Stack>
          <Suspense fallback={<div />}>
            <InboxViewToggle />
          </Suspense>
        </Group>
      </Stack>

      {/* Filters */}
      <Suspense
        fallback={
          <Paper withBorder p="md" radius="md">
            Loading filters...
          </Paper>
        }
      >
        <InboxFilters allTags={allTags} />
      </Suspense>

      {/* Mail Items List */}
      {filteredItems.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Stack gap="md" align="center">
            <IconInbox size={48} color="var(--mantine-color-gray-5)" />
            <Text size="lg" c="dimmed" ta="center">
              {viewMode === "inbox"
                ? "No mail items found. Your mail will appear here once received."
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
            <InboxPagination
              totalPages={totalPages}
              currentPage={currentPage}
            />
          </Suspense>
        </>
      )}
    </Stack>
  );
}
