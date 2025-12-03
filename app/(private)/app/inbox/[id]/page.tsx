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
import {MailStatus} from "@/app/generated/prisma/enums";
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
      return "processed";
    default:
      return "received";
  }
}

// Cache the mail item query
const getMailItem = cache(async (mailId: string, userId: string) => {
  try {
    // First check if mail item exists and user owns it
    const mailItem = await prisma.mailItem.findUnique({
      where: {
        id: mailId,
      },
    });

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

  return (
    <Stack gap="xl" style={{width: "100%", maxWidth: "100%", minWidth: 0}}>
      {/* Header */}
      <Stack gap="sm">
        <Group justify="flex-start">
          <Link href="/app/inbox" style={{textDecoration: "none"}}>
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              size="md"
              visibleFrom="sm"
            >
              Back to Inbox
            </Button>
          </Link>
          <Link href="/app/inbox" style={{textDecoration: "none"}}>
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              size="sm"
              hiddenFrom="sm"
            >
              Back to Inbox
            </Button>
          </Link>
        </Group>
        <Stack gap="xs">
          <Group gap="sm" align="flex-start" wrap="wrap">
            <Title
              order={1}
              fw={800}
              size="h2"
              style={{
                flex: 1,
                minWidth: 200,
              }}
            >
              {mailItem.subject || "Mail Item"}
            </Title>
            <Badge
              color={statusColors[mailItem.status]}
              variant="light"
              size="lg"
              visibleFrom="sm"
            >
              {mailItem.status}
            </Badge>
            <Badge
              color={statusColors[mailItem.status]}
              variant="light"
              size="md"
              hiddenFrom="sm"
            >
              {mailItem.status}
            </Badge>
          </Group>
          <Stack gap="xs">
            {mailItem.sender && (
              <Group gap="xs" wrap="wrap">
                <IconUser size={16} color="var(--mantine-color-gray-6)" />
                <Text size="sm" c="dimmed" visibleFrom="sm">
                  {mailItem.sender}
                </Text>
                <Text size="xs" c="dimmed" hiddenFrom="sm">
                  {mailItem.sender}
                </Text>
              </Group>
            )}
            <Group gap="xs" wrap="wrap">
              <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
              <Text size="sm" c="dimmed" visibleFrom="sm">
                {new Date(mailItem.receivedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text size="xs" c="dimmed" hiddenFrom="sm">
                {new Date(mailItem.receivedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Group>
          </Stack>
        </Stack>
      </Stack>

      {/* Client component for interactive parts */}
      <MailDetailClient mailItem={mailItem} mailId={mailId} />
    </Stack>
  );
}
