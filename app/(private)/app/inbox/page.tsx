import {Suspense, cache} from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  SimpleGrid,
  Card,
  Skeleton,
  ThemeIcon,
  Button,
} from "@mantine/core";
import {
  IconInbox,
  IconHourglassHigh,
  IconCheck,
  IconMail,
  IconUserCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import {MailItemCard, MailItem} from "@/components/mail/MailItemCard";
import {InboxFilters} from "@/components/inbox/InboxFilters";
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

      // Helper function to create signed URL (extracted to avoid source map issues)
      const createEnvelopeSignedUrl = async (
        path: string
      ): Promise<string | undefined> => {
            try {
              const {data, error} = await supabase.storage
                .from(bucketName)
            .createSignedUrl(path, 3600);

              if (error) {
            return undefined;
          }
          return data?.signedUrl || undefined;
        } catch {
          return undefined;
        }
      };

      const itemsWithUrls = await Promise.all(
        mailItems.map(async (item) => {
          const envelopeScanUrl = item.envelope_scan_url
            ? await createEnvelopeSignedUrl(item.envelope_scan_url)
            : undefined;

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
            No mail items found. Your mail will appear here once received.
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

  // Redirect to KYC page only if REJECTED
  if (kycStatus === "REJECTED") {
    redirect("/app/kyc");
  }

  // Handle NOT_STARTED status - show KYC required UI
  if (kycStatus === "NOT_STARTED") {
    return (
      <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={1} fw={800} size="h2">
            Inbox
          </Title>
        </Group>

        <Card
          shadow="sm"
          padding="xl"
          radius="md"
          withBorder
          style={{
            minHeight: "500px",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack gap="xl" align="center" w="100%">
            <ThemeIcon color="blue" size={80} radius="xl" variant="light">
              <IconUserCheck size={40} />
            </ThemeIcon>
            <Stack gap="xs" align="center">
              <Title order={2} size="h3">
                Identity Verification Required
              </Title>
              <Text c="dimmed" ta="center" maw={700} size="lg">
                To protect your privacy, you must complete a quick identity
                check (KYC) before accessing your digital mailbox.
              </Text>
            </Stack>

            <SimpleGrid cols={{base: 1, md: 2}} spacing="lg" w="100%" maw={900}>
              {/* Why verification is required */}
              <Card
                withBorder
                radius="md"
                p="lg"
                w="100%"
                bg="var(--mantine-color-blue-0)"
              >
                <Stack gap="md">
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon
                      color="blue"
                      size="sm"
                      radius="xl"
                      variant="filled"
                      mt={2}
                    >
                      <IconAlertCircle size={16} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{flex: 1}}>
                      <Text fw={600} size="sm" c="dark">
                        Why this is required
                      </Text>
                    </Stack>
                  </Group>
                  <Stack gap="xs" pl="md">
                    <Text size="sm" c="dimmed" lh={1.5}>
                      • Your mail contains sensitive personal information
                    </Text>
                    <Text size="sm" c="dimmed" lh={1.5}>
                      • Prevents impersonation or unauthorized access
                    </Text>
                    <Text size="sm" c="dimmed" lh={1.5}>
                      • Ensures secure digital delivery
                    </Text>
                    <Text size="sm" c="dimmed" lh={1.5}>
                      • Meets data-privacy standards
                    </Text>
                  </Stack>
                </Stack>
              </Card>

              {/* What you can do after verification */}
              <Card
                withBorder
                radius="md"
                p="lg"
                w="100%"
                bg="var(--mantine-color-green-0)"
              >
                <Stack gap="md">
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon
                      color="green"
                      size="sm"
                      radius="xl"
                      variant="filled"
                      mt={2}
                    >
                      <IconCheck size={16} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{flex: 1}}>
                      <Text fw={600} size="sm" c="dark">
                        Once verified, you can:
                      </Text>
                    </Stack>
                  </Group>
                  <Stack gap="xs" pl="md">
                    <Text size="sm" c="dimmed" lh={1.5}>
                      • Access your digital inbox
                    </Text>
                    <Text size="sm" c="dimmed" lh={1.5}>
                      • View envelopes and scans
                    </Text>
                    <Text size="sm" c="dimmed" lh={1.5}>
                      • Request scans, forwarding, or shredding
                    </Text>
                    <Text size="sm" c="dimmed" lh={1.5}>
                      • Archive, tag, and organize mail
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            </SimpleGrid>

            <Group mt="md">
              <Button
                size="lg"
                component="a"
                href="/app/kyc"
                leftSection={<IconUserCheck size={18} />}
              >
                Complete Identity Verification
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    );
  }

  // Handle PENDING status - show notification and hide features
  if (kycStatus === "PENDING") {
    return (
      <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={1} fw={800} size="h2">
            Inbox
          </Title>
        </Group>

        <Card
          shadow="sm"
          padding="xl"
          radius="md"
          withBorder
          style={{
            minHeight: "500px",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack gap="xl" align="center" w="100%">
            <ThemeIcon color="yellow" size={80} radius="xl" variant="light">
              <IconHourglassHigh size={40} />
            </ThemeIcon>
            <Stack gap="xs" align="center">
              <Title order={2} size="h3">
                Verification Pending
              </Title>
              <Text c="dimmed" ta="center" maw={500}>
                Your identity verification is currently under review. You will
                be able to access your inbox and mail items once your
                verification is approved.
              </Text>
            </Stack>

            <Card
              withBorder
              radius="md"
              p="lg"
              w="100%"
              maw={600}
              bg="var(--mantine-color-gray-0)"
            >
              <Stack gap="md">
                <Text fw={600} size="sm">
                  What happens next?
                </Text>
                <Stack gap="sm">
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon
                      color="blue"
                      size="sm"
                      radius="xl"
                      variant="filled"
                      mt={2}
                    >
                      <IconCheck size={10} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed" lh={1.4}>
                      <Text span fw={600} c="dark">
                        Review in Progress:
                      </Text>{" "}
                      Our team is carefully reviewing the documents you
                      submitted. This process typically takes 1-2 business days.
                    </Text>
                  </Group>
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon
                      color="blue"
                      size="sm"
                      radius="xl"
                      variant="filled"
                      mt={2}
                    >
                      <IconMail size={10} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed" lh={1.4}>
                      <Text span fw={600} c="dark">
                        Notification:
                      </Text>{" "}
                      We will notify you via email as soon as your account is
                      verified. No further action is required from you at this
                      time.
                    </Text>
                  </Group>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Card>
      </Stack>
    );
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
  const currentPage = parseInt(params.page || "1", 10);

  // Get mail items count for header (streaming)
  const mailItemsPromise = getMailItems(userId, {
    searchQuery,
    statusFilter,
    tagFilter,
    viewMode: "inbox", // Always show inbox, never archived
  });

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header - Matching UserDashboardClient style */}
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={4}>
          <Group gap="xs" align="center">
            <Title order={1} fw={800} size="h2">
              Inbox
            </Title>
          </Group>
          <Suspense
            fallback={<Skeleton height={20} width={150} />}
            key={`${searchQuery}-${statusFilter}-${tagFilter}`}
          >
            <MailItemsCount promise={mailItemsPromise} />
          </Suspense>
        </Stack>
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
        key={`${searchQuery}-${statusFilter}-${tagFilter}-${currentPage}`}
      >
        <MailItemsList
          userId={userId}
          filters={{
            searchQuery,
            statusFilter,
            tagFilter,
            viewMode: "inbox", // Always show inbox, never archived
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
