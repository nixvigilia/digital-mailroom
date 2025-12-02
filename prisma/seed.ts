import "dotenv/config";
import {PrismaClient} from "../app/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";

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

async function main() {
  console.log("Starting seed...");

  const plans = [
    {
      name: "Free",
      plan_type: "FREE",
      description: "Perfect for affiliates",
      price_monthly: 0.0,
      price_quarterly: null,
      price_yearly: null,
      features: [
        "Earn while you refer",
        "Affiliate link access",
        "5% cash back per subscriber",
        "Track your referrals",
        "No mail services",
        "Perfect for affiliates",
      ],
      max_mail_items: 0,
      max_team_members: null,
      is_active: true,
      is_featured: false,
      display_order: 0,
    },
    {
      name: "Digital",
      plan_type: "BASIC",
      description: "For individuals who just need their mail digitized",
      price_monthly: 299.0,
      price_quarterly: 850.0, // ~5% discount
      price_yearly: 3200.0, // ~11% discount
      features: [
        "Mail scanning & digitization",
        "5GB digital storage",
        "7-day physical retention",
        "~5,000 scanned pages",
        "Access via web app",
        "Standard quality scans",
        "No parcel handling",
      ],
      max_mail_items: 50,
      max_team_members: null,
      is_active: true,
      is_featured: false,
      display_order: 1,
    },
    {
      name: "Personal",
      plan_type: "PREMIUM",
      description: "Complete mail management solution",
      price_monthly: 499.0,
      price_quarterly: 1420.0, // ~5% discount
      price_yearly: 5300.0, // ~11% discount
      features: [
        "Everything in Digital",
        "20GB digital storage",
        "Parcel handling",
        "~20,000 scanned pages",
        "90-day physical retention",
        "High quality scans",
        "Starter kit included",
      ],
      max_mail_items: 200,
      max_team_members: null,
      is_active: true,
      is_featured: true,
      display_order: 2,
    },
    {
      name: "Business",
      plan_type: "BUSINESS",
      description: "Professional virtual office solution",
      price_monthly: 2999.0,
      price_quarterly: 8500.0, // ~5% discount
      price_yearly: 32000.0, // ~11% discount
      features: [
        "Everything in Personal",
        "200GB digital storage",
        "Virtual office address",
        "~200,000 scanned pages",
        "365-day physical retention",
        "Business registration use",
        "Professional business address",
        "Team collaboration",
      ],
      max_mail_items: 2000,
      max_team_members: 10,
      is_active: true,
      is_featured: false,
      display_order: 3,
    },
    {
      name: "Enterprise",
      plan_type: "ENTERPRISE",
      description: "Custom solution for large organizations",
      price_monthly: 9999.0,
      price_quarterly: 28000.0, // ~7% discount
      price_yearly: 105000.0, // ~13% discount
      features: [
        "Everything in Business",
        "Unlimited digital storage",
        "Custom virtual office",
        "Unlimited scanned pages",
        "Extended physical retention",
        "Dedicated account manager",
        "Custom integrations",
        "Priority support",
        "Unlimited team members",
      ],
      max_mail_items: null,
      max_team_members: null,
      is_active: true,
      is_featured: false,
      display_order: 4,
    },
  ];

  for (const plan of plans) {
    const created = await prisma.package.upsert({
      where: {plan_type: plan.plan_type},
      update: plan,
      create: plan,
    });
    console.log(`Created/Updated ${plan.name} plan:`, created.id);
  }

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
