import {Suspense, cache} from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  SimpleGrid,
  Card,
  Skeleton,
} from "@mantine/core";
import {IconInbox} from "@tabler/icons-react";
import {MailItemCard, MailItem} from "@/components/mail/MailItemCard";
import {InboxFilters} from "@/components/inbox/InboxFilters";
import {InboxViewToggle} from "@/components/inbox/InboxViewToggle";
import {InboxPagination} from "@/components/inbox/InboxPagination";
import {
  getCurrentUser,
  getKYCStatus,
  getCurrentUserPlanType,
} from "@/utils/supabase/dal";
import {prisma} from "@/utils/prisma";
import {redirect} from "next/navigation";
import {MailStatus} from "@/app/generated/prisma/enums";
import {createClient} from "@/utils/supabase/server";

interface InboxPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    tag?: string;
    view?: string;
    page?: string;
  }>;
}

// Map database MailStatus enum to component status strings
function mapStatusToComponentStatus(
  status: MailStatus,
  isArchived: boolean
): "received" | "scanned" | "processed" | "archived" {
  if (isArchived) return "archived";

  switch (status) {
    case MailStatus.RECEIVED:
      return "received";
    case MailStatus.SCANNED:
      return "scanned";
    case MailStatus.PROCESSED:
    case MailStatus.FORWARDED:
    case MailStatus.SHREDDED:
      return "processed";
    default:
      return "received";
  }
}

// Cache the mail items query for better performance
const getMailItems = cache(
  async (
    userId: string,
    filters: {
      searchQuery?: string;
      statusFilter?: string;
      tagFilter?: string;
      viewMode?: "inbox" | "archived";
    }
  ): Promise<MailItem[]> => {
    try {
      const where: any = {
        profile_id: userId,
        business_account_id: null, // Only personal mail items
      };

      // Handle archived filter
      if (filters.viewMode === "archived") {
        where.is_archived = true;
      } else {
        where.is_archived = false;
      }

      // Handle status filter
      if (filters.statusFilter && filters.statusFilter !== "all") {
        const statusMap: Record<string, MailStatus> = {
          received: MailStatus.RECEIVED,
          scanned: MailStatus.SCANNED,
          processed: MailStatus.PROCESSED,
          archived: MailStatus.ARCHIVED,
        };
        where.status = statusMap[filters.statusFilter] || undefined;
      }

      // Handle search query
      if (filters.searchQuery) {
        where.OR = [
          {sender: {contains: filters.searchQuery, mode: "insensitive"}},
          {subject: {contains: filters.searchQuery, mode: "insensitive"}},
        ];
      }

      // Handle tag filter
      if (filters.tagFilter && filters.tagFilter !== "") {
        where.tags = {has: filters.tagFilter};
      }

      const mailItems = await prisma.mailItem.findMany({
        where,
        orderBy: {received_at: "desc"},
        take: 1000, // Limit to prevent performance issues
      });

      // Convert storage paths to signed URLs
      const supabase = await createClient();
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME || "keep";

      const itemsWithUrls = await Promise.all(
        mailItems.map(async (item) => {
          let envelopeScanUrl: string | undefined = undefined;
          if (item.envelope_scan_url) {
            try {
              const {data, error} = await supabase.storage
                .from(bucketName)
                .createSignedUrl(item.envelope_scan_url, 3600); // 1 hour expiry

              if (error) {
                console.error("Error creating signed URL for envelope:", error);
                console.error("Storage path:", item.envelope_scan_url);
              } else {
                envelopeScanUrl = data?.signedUrl || undefined;
              }
            } catch (error) {
              console.error(
                "Exception creating signed URL for envelope:",
                error
              );
              console.error("Storage path:", item.envelope_scan_url);
            }
          }

          return {
            id: item.id,
            receivedAt: item.received_at,
            sender: item.sender,
            subject: item.subject || undefined,
            status: mapStatusToComponentStatus(item.status, item.is_archived),
            envelopeScanUrl,
            hasFullScan: item.has_full_scan,
            tags: item.tags || [],
            category: item.category || undefined,
          };
        })
      );

      return itemsWithUrls;
    } catch (error) {
      console.error("Error fetching mail items:", error);
      return [];
    }
  }
);

// Get all unique tags for filter dropdown
const getAllTags = cache(async (userId: string): Promise<string[]> => {
  try {
    const mailItems = await prisma.mailItem.findMany({
      where: {
        profile_id: userId,
        business_account_id: null,
      },
      select: {
        tags: true,
      },
    });

    const allTags = Array.from(
      new Set(mailItems.flatMap((item) => item.tags || []))
    );
    return allTags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
});

// Server component for mail items list with streaming
async function MailItemsList({
  userId,
  filters,
  currentPage,
}: {
  userId: string;
  filters: {
    searchQuery: string;
    statusFilter: string;
    tagFilter: string;
    viewMode: "inbox" | "archived";
  };
  currentPage: number;
}) {
  const itemsPerPage = 12;
  const mailItems = await getMailItems(userId, filters);

  // Pagination logic
  const totalPages = Math.ceil(mailItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = mailItems.slice(startIndex, endIndex);

  if (mailItems.length === 0) {
    return (
      <Card shadow="sm" padding="xl" radius="md" withBorder={false}>
        <Stack gap="md" align="center">
          <IconInbox size={48} color="var(--mantine-color-gray-5)" />
          <Text size="lg" c="dimmed" ta="center">
            {filters.viewMode === "inbox"
              ? "No mail items found. Your mail will appear here once received."
              : "No archived items."}
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
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
      <Suspense fallback={<Skeleton height={40} />}>
        <InboxPagination totalPages={totalPages} currentPage={currentPage} />
      </Suspense>
    </>
  );
}

// Server component for filters with streaming
async function InboxFiltersWrapper({userId}: {userId: string}) {
  const allTags = await getAllTags(userId);
  return <InboxFilters allTags={allTags} />;
}

export default async function InboxPage({searchParams}: InboxPageProps) {
  const currentUser = await getCurrentUser();

  // This should never be null since middleware protects /app routes
  if (!currentUser) {
    redirect("/login");
  }

  const userId = currentUser.userId;

  // Check KYC status
  const kycStatus = await getKYCStatus(userId);

  // Redirect to KYC page if PENDING or REJECTED
  if (kycStatus === "PENDING" || kycStatus === "REJECTED") {
    redirect("/app/kyc");
  }

  // Get user's plan type
  const planType = await getCurrentUserPlanType();

  // Redirect free users to pricing page
  if (planType === "FREE") {
    redirect("/app/pricing");
  }

  // Await searchParams if it's a Promise (Next.js 15)
  const params = await searchParams;

  // Get filters from URL search params
  const searchQuery = params.search || "";
  const statusFilter = params.status || "all";
  const tagFilter = params.tag || "";
  const viewMode = (params.view as "inbox" | "archived") || "inbox";
  const currentPage = parseInt(params.page || "1", 10);

  // Get mail items count for header (streaming)
  const mailItemsPromise = getMailItems(userId, {
    searchQuery,
    statusFilter,
    tagFilter,
    viewMode,
  });

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header - Matching UserDashboardClient style */}
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={4}>
          <Group gap="xs" align="center">
            <Title order={1} fw={800} size="h2">
              {viewMode === "inbox" ? "Inbox" : "Archived"}
            </Title>
          </Group>
          <Suspense
            fallback={<Skeleton height={20} width={150} />}
            key={`${searchQuery}-${statusFilter}-${tagFilter}-${viewMode}`}
          >
            <MailItemsCount promise={mailItemsPromise} />
          </Suspense>
        </Stack>
        <Suspense fallback={<Skeleton height={36} width={200} />}>
          <InboxViewToggle />
        </Suspense>
      </Group>

      {/* Filters - Streaming */}
      <Suspense
        fallback={
          <Card shadow="sm" padding="md" radius="md" withBorder={false}>
            <Skeleton height={60} />
          </Card>
        }
      >
        <InboxFiltersWrapper userId={userId} />
      </Suspense>

      {/* Mail Items List - Streaming */}
      <Suspense
        fallback={
          <SimpleGrid
            cols={{base: 1, sm: 2, md: 3, lg: 4}}
            spacing={{base: "md", sm: "lg", md: "xl"}}
          >
            {Array.from({length: 8}).map((_, i) => (
              <Skeleton key={i} height={300} radius="md" />
            ))}
          </SimpleGrid>
        }
        key={`${searchQuery}-${statusFilter}-${tagFilter}-${viewMode}-${currentPage}`}
      >
        <MailItemsList
          userId={userId}
          filters={{
            searchQuery,
            statusFilter,
            tagFilter,
            viewMode,
          }}
          currentPage={currentPage}
        />
      </Suspense>
    </Stack>
  );
}

// Server component for mail items count
async function MailItemsCount({promise}: {promise: Promise<MailItem[]>}) {
  const mailItems = await promise;
  const count = mailItems.length;

  return (
    <Text c="dimmed" size="sm">
      {count} {count === 1 ? "item" : "items"}
    </Text>
  );
}
