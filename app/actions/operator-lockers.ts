"use server";

import {prisma} from "@/utils/prisma";
import {revalidatePath} from "next/cache";
import {z} from "zod";

// Validation Schemas
const LocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().default("Philippines"),
  image_url: z.string().optional(),
  map_url: z.string().optional(),
  is_active: z.boolean().default(true),
});

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

const BatchMailboxSchema = z.object({
  cluster_id: z.string().uuid(),
  prefix: z.string().min(1, "Prefix is required"),
  start_number: z.number().int().positive(),
  count: z.number().int().positive().max(100),
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
        clusters: {
          orderBy: {name: "asc"},
          include: {
            _count: {
              select: {mailboxes: true},
            },
          },
        },
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

export async function getMailingLocation(id: string) {
  try {
    const location = await prisma.mailingLocation.findUnique({
      where: {id},
      include: {
        clusters: {
          orderBy: {name: "asc"},
          include: {
            _count: {
              select: {mailboxes: true},
            },
          },
        },
      },
    });
    if (!location) {
      return {success: false, error: "Location not found"};
    }
    return {success: true, data: location};
  } catch (error) {
    console.error("Error fetching location:", error);
    return {success: false, error: "Failed to fetch location"};
  }
}

export async function createMailingLocation(
  locationData: z.infer<typeof LocationSchema>,
  clusters: Array<{name: string; description?: string}>
) {
  try {
    // Validate location data
    const validatedLocation = LocationSchema.parse(locationData);

    // Ensure at least one cluster is provided
    if (!clusters || clusters.length === 0) {
      return {
        success: false,
        error: "At least one mailbox cluster must be assigned to the location",
      };
    }

    // Validate cluster names
    for (const cluster of clusters) {
      if (!cluster.name || cluster.name.trim().length === 0) {
        return {
          success: false,
          error: "All clusters must have a name",
        };
      }
    }

    // Create location with clusters in a transaction
    const location = await prisma.mailingLocation.create({
      data: {
        ...validatedLocation,
        clusters: {
          create: clusters.map((c) => ({
            name: c.name,
            description: c.description || null,
          })),
        },
      },
      include: {
        clusters: true,
      },
    });

    revalidatePath("/operator/lockers");
    return {success: true, data: location};
  } catch (error: any) {
    console.error("Error creating location:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        error: "A location with this name already exists",
      };
    }
    return {success: false, error: "Failed to create location"};
  }
}

export async function updateMailingLocation(
  id: string,
  data: Partial<z.infer<typeof LocationSchema>>
) {
  try {
    const location = await prisma.mailingLocation.update({
      where: {id},
      data,
      include: {
        clusters: true,
      },
    });
    revalidatePath("/operator/lockers");
    revalidatePath(`/operator/lockers/${id}`);
    return {success: true, data: location};
  } catch (error) {
    console.error("Error updating location:", error);
    return {success: false, error: "Failed to update location"};
  }
}

export async function deleteMailingLocation(id: string) {
  try {
    // Check if location has clusters
    const location = await prisma.mailingLocation.findUnique({
      where: {id},
      include: {
        _count: {
          select: {clusters: true, subscriptions: true},
        },
      },
    });

    if (!location) {
      return {success: false, error: "Location not found"};
    }

    // Check if location has active subscriptions
    if (location._count.subscriptions > 0) {
      return {
        success: false,
        error:
          "Cannot delete location with active subscriptions. Please reassign or cancel subscriptions first.",
      };
    }

    // Delete location (clusters will be cascade deleted)
    await prisma.mailingLocation.delete({
      where: {id},
    });

    revalidatePath("/operator/lockers");
    return {success: true};
  } catch (error) {
    console.error("Error deleting location:", error);
    return {success: false, error: "Failed to delete location"};
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
    // Check if this is the last cluster for the location
    const location = await prisma.mailingLocation.findUnique({
      where: {id: locationId},
      include: {
        _count: {
          select: {clusters: true},
        },
      },
    });

    if (!location) {
      return {success: false, error: "Location not found"};
    }

    // Check if this is the last cluster
    if (location._count.clusters <= 1) {
      return {
        success: false,
        error:
          "Cannot delete the last cluster. Each mailing location must have at least one cluster assigned.",
      };
    }

    // Check if cluster has mailboxes
    const cluster = await prisma.mailboxCluster.findUnique({
      where: {id},
      include: {
        _count: {
          select: {mailboxes: true},
        },
      },
    });

    if (cluster && cluster._count.mailboxes > 0) {
      return {
        success: false,
        error:
          "Cannot delete cluster with mailboxes. Please delete or reassign mailboxes first.",
      };
    }

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

// Natural sort function for alphanumeric strings (e.g., "A-1", "A-2", "A-10")
function naturalSort(a: string, b: string): number {
  const aParts = a.split(/(\d+)/);
  const bParts = b.split(/(\d+)/);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || "";
    const bPart = bParts[i] || "";

    // If both parts are numeric, compare as numbers
    if (/^\d+$/.test(aPart) && /^\d+$/.test(bPart)) {
      const numA = parseInt(aPart, 10);
      const numB = parseInt(bPart, 10);
      if (numA !== numB) {
        return numA - numB;
      }
    } else {
      // Otherwise, compare as strings
      if (aPart !== bPart) {
        return aPart.localeCompare(bPart);
      }
    }
  }
  return 0;
}

export async function getMailboxes(clusterId: string) {
  try {
    const mailboxes = await prisma.mailbox.findMany({
      where: {cluster_id: clusterId},
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

    // Convert Decimal fields to numbers for client component compatibility
    const serializedMailboxes = mailboxes.map((mailbox) => ({
      ...mailbox,
      width: Number(mailbox.width),
      height: Number(mailbox.height),
      depth: Number(mailbox.depth),
    }));

    // Sort using natural sort for proper alphanumeric ordering (A-1, A-2, A-10 instead of A-1, A-10, A-2)
    serializedMailboxes.sort((a, b) => naturalSort(a.box_number, b.box_number));

    return {success: true, data: serializedMailboxes};
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

export async function createMailboxesBatch(
  data: z.infer<typeof BatchMailboxSchema>
) {
  try {
    const validated = BatchMailboxSchema.parse(data);

    // Fetch cluster to get location ID for revalidation path
    const cluster = await prisma.mailboxCluster.findUnique({
      where: {id: validated.cluster_id},
    });

    if (!cluster) {
      return {success: false, error: "Cluster not found"};
    }

    // Generate box numbers
    const mailboxes = [];
    for (let i = 0; i < validated.count; i++) {
      const boxNumber = `${validated.prefix}-${validated.start_number + i}`;
      mailboxes.push({
        cluster_id: validated.cluster_id,
        box_number: boxNumber,
        type: validated.type,
        width: validated.width,
        height: validated.height,
        depth: validated.depth,
        dimension_unit: validated.dimension_unit,
      });
    }

    // Check for existing box numbers to avoid conflicts
    const existingBoxNumbers = await prisma.mailbox.findMany({
      where: {
        cluster_id: validated.cluster_id,
        box_number: {
          in: mailboxes.map((m) => m.box_number),
        },
      },
      select: {box_number: true},
    });

    if (existingBoxNumbers.length > 0) {
      const conflicts = existingBoxNumbers.map((m) => m.box_number).join(", ");
      return {
        success: false,
        error: `Box numbers already exist: ${conflicts}`,
      };
    }

    // Create all mailboxes in a transaction
    const created = await prisma.mailbox.createMany({
      data: mailboxes,
      skipDuplicates: true,
    });

    revalidatePath(
      `/operator/lockers/${cluster.mailing_location_id}/clusters/${validated.cluster_id}`
    );

    return {
      success: true,
      data: {count: created.count},
      message: `Successfully created ${created.count} mailboxes`,
    };
  } catch (error: any) {
    console.error("Error creating mailboxes batch:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        error: "One or more box numbers already exist in this cluster",
      };
    }
    return {success: false, error: "Failed to create mailboxes"};
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
