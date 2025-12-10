import "dotenv/config";
import {PrismaClient} from "../app/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import {createClient} from "@supabase/supabase-js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // User's specific IP from Env
  const mainIp = process.env.MAIN_IP_ADDRESS;
  if (mainIp) {
    await prisma.allowedIP.upsert({
      where: {ip_address: mainIp},
      update: {},
      create: {
        ip_address: mainIp,
        description: "Main Admin IP",
      },
    });
    console.log(`Seeded allowed IP: ${mainIp}`);
  }

  console.log("Seeded allowed IPs");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn(
      "Supabase credentials not found, skipping admin auth creation"
    );
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`Creating admin user: ${adminEmail}`);

  // 1. Create Supabase Auth User
  const {data: authUser, error: authError} =
    await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: "System",
        last_name: "Admin",
      },
    });

  if (authError) {
    console.error(
      "Error creating admin auth user (might already exist):",
      authError.message
    );
    // Try to get the user if it already exists
    const {
      data: {users},
    } = await supabase.auth.admin.listUsers();
    const existingUser = users.find((u) => u.email === adminEmail);

    if (existingUser) {
      console.log("Found existing admin user, updating database record...");
      await prisma.profile.upsert({
        where: {id: existingUser.id},
        update: {
          role: "SYSTEM_ADMIN",
          user_type: "ADMIN",
          password_hint: "Default admin password",
        },
        create: {
          id: existingUser.id,
          email: adminEmail,
          role: "SYSTEM_ADMIN",
          user_type: "ADMIN",
          password_hint: "Default admin password",
          kyc_verification: {
            create: {
              first_name: "System",
              last_name: "Admin",
              status: "APPROVED",
              date_of_birth: new Date(),
              phone_number: "N/A",
              address: "HQ",
              city: "HQ",
              province: "HQ",
              postal_code: "0000",
              country: "Philippines",
              id_type: "INTERNAL",
            },
          },
        },
      });
    }
    return;
  }

  if (authUser.user) {
    // 2. Create Database Profile
    // Check if profile exists first to avoid unique constraint error
    const existingProfile = await prisma.profile.findUnique({
      where: {id: authUser.user.id},
    });

    if (existingProfile) {
      console.log("Admin profile already exists, updating...");
      await prisma.profile.update({
        where: {id: authUser.user.id},
        data: {
          role: "SYSTEM_ADMIN",
          user_type: "ADMIN",
          password_hint: "Default admin password",
        },
      });
    } else {
      await prisma.profile.create({
        data: {
          id: authUser.user.id,
          email: adminEmail,
          role: "SYSTEM_ADMIN",
          user_type: "ADMIN",
          password_hint: "Default admin password",
          kyc_verification: {
            create: {
              first_name: "System",
              last_name: "Admin",
              status: "APPROVED",
              date_of_birth: new Date(),
              phone_number: "N/A",
              address: "HQ",
              city: "HQ",
              province: "HQ",
              postal_code: "0000",
              country: "Philippines",
              id_type: "INTERNAL",
            },
          },
        },
      });
    }
    console.log("Admin user created/updated successfully");
  }
}

async function createLocationsAndMailboxes() {
  console.log("Seeding locations and mailboxes...");
  const locations = [
    {
      name: "Makati Central",
      address: "123 Ayala Avenue",
      city: "Makati",
      province: "Metro Manila",
      postal_code: "1200",
      country: "Philippines",
      image_url: "https://placehold.co/600x400?text=Makati+Branch",
      map_url: "https://maps.google.com/?q=Makati",
      is_active: true,
    },
    {
      name: "BGC Hub",
      address: "456 Bonifacio High Street",
      city: "Taguig",
      province: "Metro Manila",
      postal_code: "1634",
      country: "Philippines",
      image_url: "https://placehold.co/600x400?text=BGC+Branch",
      map_url: "https://maps.google.com/?q=BGC",
      is_active: true,
    },
    {
      name: "Cebu IT Park",
      address: "789 IT Park",
      city: "Cebu City",
      province: "Cebu",
      postal_code: "6000",
      country: "Philippines",
      image_url: "https://placehold.co/600x400?text=Cebu+Branch",
      map_url: "https://maps.google.com/?q=Cebu",
      is_active: true,
    },
    {
      name: "Davao Center",
      address: "101 Roxas Avenue",
      city: "Davao City",
      province: "Davao del Sur",
      postal_code: "8000",
      country: "Philippines",
      image_url: "https://placehold.co/600x400?text=Davao+Branch",
      map_url: "https://maps.google.com/?q=Davao",
      is_active: true,
    },
  ];

  for (const loc of locations) {
    const existing = await prisma.mailingLocation.findFirst({
      where: {name: loc.name},
    });

    let locationId = existing?.id;

    if (!existing) {
      const created = await prisma.mailingLocation.create({
        data: loc,
      });
      locationId = created.id;
      console.log(`Created location: ${loc.name}`);
    } else {
      console.log(`Location exists: ${loc.name}`);
      await prisma.mailingLocation.update({
        where: {id: locationId},
        data: loc,
      });
    }

    if (locationId) {
      // Create Clusters
      const clusters = ["Cluster A", "Cluster B", "Cluster C"];

      for (const clusterName of clusters) {
        const cluster = await prisma.mailboxCluster.upsert({
          where: {
            mailing_location_id_name: {
              mailing_location_id: locationId,
              name: clusterName,
            },
          },
          create: {
            mailing_location_id: locationId,
            name: clusterName,
            description: `Standard CBU Cluster ${clusterName}`,
          },
          update: {},
        });

        // Updated dimensions based on USPS standards / user request (in Inches)
        // Standard: 12" W x 3" H x 15" D
        // Parcel Locker: 12" W x 15" H x 15" D
        // Ratio: 1 parcel locker per 5 mail compartments

        // Extract cluster letter from cluster name (e.g., "Cluster A" -> "A")
        const clusterLetter = clusterName.replace("Cluster ", "").trim();

        const mailboxConfigs = [
          // 15 Standard + 5 Large = 20 Mail Compartments
          // We need 20 / 5 = 4 Parcel Lockers
          {
            type: "STANDARD",
            count: 15,
            width: 12,
            height: 3,
            depth: 15,
          },
          {
            type: "LARGE",
            count: 5,
            width: 12,
            height: 6, // Double the height of standard
            depth: 15,
          },
          {
            type: "PARCEL_LOCKER",
            count: 4,
            width: 12,
            height: 15,
            depth: 15,
          },
        ];

        // Sequential numbering across all mailbox types within a cluster
        let boxCounter = 1;

        for (const config of mailboxConfigs) {
          for (let i = 1; i <= config.count; i++) {
            // Box number format: [Cluster]-[Num] -> A-1, A-2, A-3 (no zero padding)
            const boxNumber = `${clusterLetter}-${boxCounter}`;

            await prisma.mailbox.upsert({
              where: {
                cluster_id_box_number: {
                  cluster_id: cluster.id,
                  box_number: boxNumber,
                },
              },
              create: {
                cluster_id: cluster.id,
                box_number: boxNumber,
                type: config.type as any,
                width: config.width,
                height: config.height,
                depth: config.depth,
                dimension_unit: "INCH",
                is_occupied: false,
              },
              update: {
                width: config.width,
                height: config.height,
                depth: config.depth,
                dimension_unit: "INCH",
              },
            });

            boxCounter++;
          }
        }
        console.log(`Seeded mailboxes for ${loc.name} - ${clusterName}`);
      }
    }
  }
}

async function main() {
  console.log("Starting seed...");
  await createLocationsAndMailboxes();

  // Update or Create Plans
  const plans = [
    {
      name: "Free",
      plan_type: "FREE",
      intended_for: "Perfect for affiliates",
      description: "Perfect for affiliates",
      price_monthly: 0.0,
      price_quarterly: null,
      price_yearly: null,
      features: [
        "Earn while you refer",
        "Affiliate link access",
        "Track your referrals",
        "No mail services",
      ],
      not_included: ["No mail services"],
      max_scanned_pages: 0,
      retention_days: 0,
      digital_storage_mb: 0,
      max_team_members: null,
      is_active: true,
      is_featured: false,
      display_order: 0,
      cashback_percentage: 5.0,
    },
    {
      name: "Digital",
      plan_type: "BASIC",
      intended_for: "For personal use only",
      description: "For individuals who just need their mail digitized",
      price_monthly: 299.0,
      price_quarterly: 850.0, // ~5% discount
      price_yearly: 3200.0, // ~11% discount
      features: [
        "Mail scanning & digitization",
        "Access via web app",
        "Standard quality scans",
      ],
      not_included: ["No parcel handling"],
      max_scanned_pages: 5000,
      retention_days: 7,
      digital_storage_mb: 5120, // 5GB
      max_team_members: null,
      is_active: true,
      is_featured: false,
      display_order: 1,
      cashback_percentage: 5.0,
    },
    {
      name: "Personal",
      plan_type: "PREMIUM",
      intended_for: "For personal use only",
      description: "Complete mail management solution",
      price_monthly: 499.0,
      price_quarterly: 1420.0, // ~5% discount
      price_yearly: 5300.0, // ~11% discount
      features: [
        "Everything in Digital",
        "Parcel handling",
        "High quality scans",
        "Starter kit included",
      ],
      not_included: [],
      max_scanned_pages: 20000,
      retention_days: 90,
      digital_storage_mb: 20480, // 20GB
      max_team_members: null,
      is_active: true,
      is_featured: true,
      display_order: 2,
      cashback_percentage: 5.0,
    },
    {
      name: "Business",
      plan_type: "BUSINESS",
      intended_for: "For business use",
      description: "Professional virtual office solution",
      price_monthly: 2999.0,
      price_quarterly: 8500.0, // ~5% discount
      price_yearly: 32000.0, // ~11% discount
      features: [
        "Everything in Personal",
        "Virtual office address",
        "Business registration use",
        "Professional business address",
        "Team collaboration",
      ],
      not_included: [],
      max_scanned_pages: 200000,
      retention_days: 365,
      digital_storage_mb: 204800, // 200GB
      max_team_members: 10,
      is_active: true,
      is_featured: false,
      display_order: 3,
      cashback_percentage: 5.0,
    },
  ];

  for (const plan of plans) {
    // Upsert instead of create only if it doesn't exist
    await prisma.package.upsert({
      where: {plan_type: plan.plan_type},
      update: plan,
      create: plan,
    });
    console.log(`Upserted ${plan.name} plan`);
  }

  await createAdminUser();

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
