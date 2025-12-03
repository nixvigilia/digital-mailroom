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
  // Note: If the DB has a trigger on auth.users, this will automatically create a public.profile record
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
        },
      });
    }
    return;
  }

  if (authUser.user) {
    // 2. Create or Update Database Profile
    // We use upsert here because the trigger on auth.users might have already created the profile
    await prisma.profile.upsert({
      where: {id: authUser.user.id},
      update: {
        role: "SYSTEM_ADMIN",
        user_type: "ADMIN",
        password_hint: "Default admin password",
      },
      create: {
        id: authUser.user.id,
        email: adminEmail,
        role: "SYSTEM_ADMIN",
        user_type: "ADMIN",
        password_hint: "Default admin password",
      },
    });
    console.log("Admin user created successfully");
  }
}

async function main() {
  await createAdminUser();
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
