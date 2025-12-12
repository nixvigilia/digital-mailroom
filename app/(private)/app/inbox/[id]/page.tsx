import {Suspense, cache} from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Badge,
  Center,
  Loader,
} from "@mantine/core";
import {IconArrowLeft, IconCalendar, IconUser} from "@tabler/icons-react";
import Link from "next/link";
import {MailActions} from "@/components/mail/MailActions";
import {MailDetailClient} from "@/components/mail/MailDetailClient";
import {
  getCurrentUser,
  getKYCStatus,
  getCurrentUserPlanType,
} from "@/utils/supabase/dal";
import {prisma} from "@/utils/prisma";
import {redirect} from "next/navigation";
import {
  MailStatus,
  ActionType,
  ActionStatus,
} from "@/app/generated/prisma/enums";
import {createClient} from "@/utils/supabase/server";

interface MailDetailPageProps {
  params: Promise<{id: string}>;
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
    case MailStatus.DISPOSED:
      return "processed";
    default:
      return "received";
  }
}

// Cache the mail item query
const getMailItem = cache(async (mailId: string, userId: string) => {
  try {
    // Fetch mail item and profile in parallel
    const [mailItem, profile] = await Promise.all([
      prisma.mailItem.findUnique({
        where: {
          id: mailId,
        },
        include: {
          action_requests: {
            where: {
              OR: [
                {
                  action_type: ActionType.OPEN_AND_SCAN,
                  status: {
                    in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS],
                  },
                },
                {
                  action_type: ActionType.FORWARD,
                  status: {
                    in: [
                      ActionStatus.PENDING,
                      ActionStatus.IN_PROGRESS,
                      ActionStatus.COMPLETED,
                    ],
                  },
                },
                {
                  action_type: ActionType.DISPOSE,
                  status: {
                    in: [ActionStatus.PENDING, ActionStatus.IN_PROGRESS],
                  },
                },
              ],
            },
            orderBy: {created_at: "desc"},
          },
        },
      }),
      prisma.profile.findUnique({
        where: {id: userId},
        select: {shredding_pin_hash: true, default_forward_address: true},
      }),
    ]);

    // Security check: Ensure user owns this mail item
    if (!mailItem || mailItem.profile_id !== userId) {
      console.error("Access denied: User does not own this mail item", {
        mailId,
        userId,
        mailItemProfileId: mailItem?.profile_id,
      });
      return null;
    }

    // Additional check: Only personal mail items (not business)
    if (mailItem.business_account_id !== null) {
      console.error("Access denied: This is a business mail item", {
        mailId,
        businessAccountId: mailItem.business_account_id,
      });
      return null;
    }

    // Convert storage paths to signed URLs
    const supabase = await createClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET_NAME || "keep";

    let envelopeScanUrl: string | undefined = undefined;
    if (mailItem.envelope_scan_url) {
      try {
        const {data, error} = await supabase.storage
          .from(bucketName)
          .createSignedUrl(mailItem.envelope_scan_url, 3600); // 1 hour expiry

        if (error) {
          console.error(
            "Error creating signed URL for envelope:",
            error.message
          );
          console.error("Full error object:", JSON.stringify(error, null, 2));
          console.error("Storage path:", mailItem.envelope_scan_url);
        } else {
          envelopeScanUrl = data?.signedUrl || undefined;
        }
      } catch (error) {
        console.error("Exception creating signed URL for envelope:", error);
        console.error("Storage path:", mailItem.envelope_scan_url);
      }
    }

    let fullScanUrl: string | undefined = undefined;
    if (mailItem.full_scan_url) {
      try {
        const {data, error} = await supabase.storage
          .from(bucketName)
          .createSignedUrl(mailItem.full_scan_url, 3600); // 1 hour expiry

        if (error) {
          console.error(
            "Error creating signed URL for full scan:",
            error.message
          );
          console.error("Full error object:", JSON.stringify(error, null, 2));
          console.error("Storage path:", mailItem.full_scan_url);
        } else {
          fullScanUrl = data?.signedUrl || undefined;
        }
      } catch (error) {
        console.error("Exception creating signed URL for full scan:", error);
        console.error("Storage path:", mailItem.full_scan_url);
      }
    }

    const pendingScanRequest =
      mailItem.action_requests.find(
        (req) =>
          req.action_type === ActionType.OPEN_AND_SCAN &&
          (req.status === ActionStatus.PENDING ||
            req.status === ActionStatus.IN_PROGRESS)
      ) || null;

    const pendingForwardRequest =
      mailItem.action_requests.find(
        (req) =>
          req.action_type === ActionType.FORWARD &&
          (req.status === ActionStatus.PENDING ||
            req.status === ActionStatus.IN_PROGRESS)
      ) || null;

    const completedForwardRequest =
      mailItem.action_requests.find(
        (req) =>
          req.action_type === ActionType.FORWARD &&
          req.status === ActionStatus.COMPLETED
      ) || null;

    const pendingDisposeRequest =
      mailItem.action_requests.find(
        (req) =>
          req.action_type === ActionType.DISPOSE &&
          (req.status === ActionStatus.PENDING ||
            req.status === ActionStatus.IN_PROGRESS)
      ) || null;

    const isForwarded =
      mailItem.status === MailStatus.FORWARDED || !!completedForwardRequest;

    return {
      id: mailItem.id,
      receivedAt: mailItem.received_at,
      sender: mailItem.sender,
      subject: mailItem.subject || undefined,
      status: mapStatusToComponentStatus(mailItem.status, mailItem.is_archived),
      envelopeScanUrl,
      hasFullScan: mailItem.has_full_scan,
      fullScanUrl,
      tags: mailItem.tags || [],
      category: mailItem.category || undefined,
      notes: mailItem.notes || undefined,
      defaultForwardAddress: profile?.default_forward_address || null,
      hasShreddingPin: !!profile?.shredding_pin_hash,
      pendingScanRequest: pendingScanRequest
        ? {
            status: pendingScanRequest.status,
            requestedAt: pendingScanRequest.created_at,
          }
        : null,
      pendingForwardRequest: pendingForwardRequest
        ? {
            status: pendingForwardRequest.status,
            requestedAt: pendingForwardRequest.created_at,
          }
        : null,
      pendingDisposeRequest: pendingDisposeRequest
        ? {
            status: pendingDisposeRequest.status,
            requestedAt: pendingDisposeRequest.created_at,
          }
        : null,
      isForwarded,
    };
  } catch (error) {
    console.error("Error fetching mail item:", error);
    return null;
  }
});

export default async function MailDetailPage({params}: MailDetailPageProps) {
  const currentUser = await getCurrentUser();

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

  const {id} = await params;
  const mailItemPromise = getMailItem(id, userId);

  return (
    <Suspense
      fallback={
        <Center style={{minHeight: 400}}>
          <Loader size="lg" />
        </Center>
      }
    >
      <MailDetailContent mailItemPromise={mailItemPromise} mailId={id} />
    </Suspense>
  );
}

async function MailDetailContent({
  mailItemPromise,
  mailId,
}: {
  mailItemPromise: Promise<any>;
  mailId: string;
}) {
  const mailItem = await mailItemPromise;

  if (!mailItem) {
    return (
      <Stack gap="md" align="center" py="xl">
        <Text size="lg" c="dimmed">
          Mail item not found
        </Text>
        <Link href="/app/inbox" style={{textDecoration: "none"}}>
          <Button leftSection={<IconArrowLeft size={18} />}>
            Back to Inbox
          </Button>
        </Link>
      </Stack>
    );
  }

  const statusColors: Record<string, string> = {
    received: "blue",
    scanned: "green",
    processed: "gray",
    archived: "orange",
  };

  const formattedDate = new Date(mailItem.receivedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const statusLabels: Record<string, string> = {
    received: "RECEIVED",
    scanned: "SCANNED",
    processed: "PROCESSED",
    archived: "ARCHIVED",
  };

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Back Link */}
      <Link
        href="/app/inbox"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.875rem",
          color: "var(--mantine-color-blue-6)",
          marginBottom: "1rem",
        }}
      >
        <IconArrowLeft size={18} />
        <Text size="sm" c="blue">
          Back to Inbox
        </Text>
      </Link>

      {/* Header */}
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Stack gap={4}>
          <Title order={1} fw={700} size="h2">
            Mail Item
          </Title>
          <Text size="md" c="dimmed">
            From{" "}
            <Text component="span" fw={500} c="dark">
              {mailItem.sender || "Unknown"}
            </Text>{" "}
            - Received on {formattedDate}
          </Text>
        </Stack>
        <Badge
          color={statusColors[mailItem.status]}
          variant="light"
          size="lg"
          style={{
            textTransform: "uppercase",
            fontWeight: 600,
            fontSize: "0.75rem",
            padding: "0.375rem 0.75rem",
          }}
        >
          {statusLabels[mailItem.status] || mailItem.status.toUpperCase()}
        </Badge>
      </Group>

      {/* Client component for interactive parts */}
      <MailDetailClient mailItem={mailItem} mailId={mailId} />
    </Stack>
  );
}
