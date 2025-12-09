"use server";

import {prisma} from "@/utils/prisma";
import {revalidatePath} from "next/cache";
import {z} from "zod";

// Validation Schemas
const ClusterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  mailing_location_id: z.string().uuid(),
});

const MailboxSchema = z.object({
  box_number: z.string().min(1, "Box number is required"),
  cluster_id: z.string().uuid(),
  type: z.enum(["STANDARD", "LARGE", "PARCEL_LOCKER"]),
  width: z.number().positive(),
  height: z.number().positive(),
  depth: z.number().positive(),
  dimension_unit: z.enum(["CM", "INCH"]),
});

// --- Locations ---

export async function getMailingLocations() {
  try {
    const locations = await prisma.mailingLocation.findMany({
      orderBy: {name: "asc"},
      include: {
        _count: {
          select: {clusters: true},
        },
      },
    });
    return {success: true, data: locations};
  } catch (error) {
    console.error("Error fetching locations:", error);
    return {success: false, error: "Failed to fetch locations"};
  }
}

// --- Clusters ---

export async function getClusters(locationId: string) {
  try {
    const clusters = await prisma.mailboxCluster.findMany({
      where: {mailing_location_id: locationId},
      orderBy: {name: "asc"},
      include: {
        _count: {
          select: {mailboxes: true},
        },
      },
    });
    return {success: true, data: clusters};
  } catch (error) {
    console.error("Error fetching clusters:", error);
    return {success: false, error: "Failed to fetch clusters"};
  }
}

export async function createCluster(data: z.infer<typeof ClusterSchema>) {
  try {
    const validated = ClusterSchema.parse(data);
    const cluster = await prisma.mailboxCluster.create({
      data: validated,
    });
    revalidatePath(`/operator/lockers/${validated.mailing_location_id}`);
    return {success: true, data: cluster};
  } catch (error) {
    console.error("Error creating cluster:", error);
    return {success: false, error: "Failed to create cluster"};
  }
}

export async function updateCluster(
  id: string,
  data: Partial<z.infer<typeof ClusterSchema>>
) {
  try {
    const cluster = await prisma.mailboxCluster.update({
      where: {id},
      data,
    });
    revalidatePath(`/operator/lockers/${cluster.mailing_location_id}`);
    return {success: true, data: cluster};
  } catch (error) {
    console.error("Error updating cluster:", error);
    return {success: false, error: "Failed to update cluster"};
  }
}

export async function deleteCluster(id: string, locationId: string) {
  try {
    await prisma.mailboxCluster.delete({
      where: {id},
    });
    revalidatePath(`/operator/lockers/${locationId}`);
    return {success: true};
  } catch (error) {
    console.error("Error deleting cluster:", error);
    return {success: false, error: "Failed to delete cluster"};
  }
}

// --- Mailboxes ---

export async function getMailboxes(clusterId: string) {
  try {
    const mailboxes = await prisma.mailbox.findMany({
      where: {cluster_id: clusterId},
      orderBy: {box_number: "asc"},
      include: {
        subscriptions: {
          where: {status: "ACTIVE"},
          include: {
            profile: {
              select: {email: true},
            },
          },
        },
      },
    });
    return {success: true, data: mailboxes};
  } catch (error) {
    console.error("Error fetching mailboxes:", error);
    return {success: false, error: "Failed to fetch mailboxes"};
  }
}

export async function createMailbox(data: z.infer<typeof MailboxSchema>) {
  try {
    const validated = MailboxSchema.parse(data);
    const mailbox = await prisma.mailbox.create({
      data: validated,
    });

    // Fetch cluster to get location ID for revalidation path
    const cluster = await prisma.mailboxCluster.findUnique({
      where: {id: validated.cluster_id},
    });

    if (cluster) {
      revalidatePath(
        `/operator/lockers/${cluster.mailing_location_id}/clusters/${validated.cluster_id}`
      );
    }

    return {success: true, data: mailbox};
  } catch (error) {
    console.error("Error creating mailbox:", error);
    return {success: false, error: "Failed to create mailbox"};
  }
}

export async function updateMailbox(
  id: string,
  data: Partial<z.infer<typeof MailboxSchema>>
) {
  try {
    const mailbox = await prisma.mailbox.update({
      where: {id},
      data,
    });

    const cluster = await prisma.mailboxCluster.findUnique({
      where: {id: mailbox.cluster_id},
    });

    if (cluster) {
      revalidatePath(
        `/operator/lockers/${cluster.mailing_location_id}/clusters/${mailbox.cluster_id}`
      );
    }

    return {success: true, data: mailbox};
  } catch (error) {
    console.error("Error updating mailbox:", error);
    return {success: false, error: "Failed to update mailbox"};
  }
}

export async function deleteMailbox(id: string) {
  try {
    const mailbox = await prisma.mailbox.delete({
      where: {id},
    });

    const cluster = await prisma.mailboxCluster.findUnique({
      where: {id: mailbox.cluster_id},
    });

    if (cluster) {
      revalidatePath(
        `/operator/lockers/${cluster.mailing_location_id}/clusters/${mailbox.cluster_id}`
      );
    }

    return {success: true};
  } catch (error) {
    console.error("Error deleting mailbox:", error);
    return {success: false, error: "Failed to delete mailbox"};
  }
}

// --- Validation Logic ---

export async function validateParcelSize(
  parcel: {width: number; height: number; depth: number; unit: "CM" | "INCH"},
  mailboxId: string
) {
  try {
    const mailbox = await prisma.mailbox.findUnique({
      where: {id: mailboxId},
    });

    if (!mailbox) {
      return {success: false, error: "Mailbox not found"};
    }

    // Convert parcel dimensions to mailbox unit if necessary
    let pWidth = parcel.width;
    let pHeight = parcel.height;
    let pDepth = parcel.depth;

    if (parcel.unit !== mailbox.dimension_unit) {
      if (parcel.unit === "INCH" && mailbox.dimension_unit === "CM") {
        pWidth *= 2.54;
        pHeight *= 2.54;
        pDepth *= 2.54;
      } else if (parcel.unit === "CM" && mailbox.dimension_unit === "INCH") {
        pWidth /= 2.54;
        pHeight /= 2.54;
        pDepth /= 2.54;
      }
    }

    // Check if it fits (simple bounding box check, assuming orientation can be rotated?)
    // For MVP, let's assume strict WxHxD matching or just check volume/max dimension.
    // Better approach: Sort dimensions and compare.

    const parcelDims = [pWidth, pHeight, pDepth].sort((a, b) => a - b);
    const boxDims = [
      Number(mailbox.width),
      Number(mailbox.height),
      Number(mailbox.depth),
    ].sort((a, b) => a - b);

    const fits =
      parcelDims[0] <= boxDims[0] &&
      parcelDims[1] <= boxDims[1] &&
      parcelDims[2] <= boxDims[2];

    return {
      success: true,
      fits,
      details: {
        parcel: {
          width: pWidth,
          height: pHeight,
          depth: pDepth,
          unit: mailbox.dimension_unit,
        },
        mailbox: {
          width: Number(mailbox.width),
          height: Number(mailbox.height),
          depth: Number(mailbox.depth),
          unit: mailbox.dimension_unit,
        },
      },
    };
  } catch (error) {
    console.error("Error validating parcel size:", error);
    return {success: false, error: "Validation failed"};
  }
}
