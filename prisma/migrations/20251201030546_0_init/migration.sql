-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'OPERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'BUSINESS_ADMIN', 'TEAM_MEMBER', 'OPERATOR', 'KYC_APPROVER', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "KYBStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('BASIC', 'PREMIUM', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "MailStatus" AS ENUM ('RECEIVED', 'SCANNED', 'PROCESSED', 'ARCHIVED', 'FORWARDED', 'SHREDDED', 'HELD');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('OPEN_AND_SCAN', 'FORWARD', 'SHRED', 'HOLD', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "profile" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "email" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_type" "UserType" NOT NULL DEFAULT 'INDIVIDUAL',
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_verification" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Philippines',
    "id_type" TEXT NOT NULL,
    "id_file_front_url" TEXT,
    "id_file_back_url" TEXT,
    "consent_mail_opening" BOOLEAN NOT NULL DEFAULT false,
    "consent_data_processing" BOOLEAN NOT NULL DEFAULT false,
    "consent_terms_of_service" BOOLEAN NOT NULL DEFAULT false,
    "consent_privacy_policy" BOOLEAN NOT NULL DEFAULT false,
    "status" "KYCStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" UUID,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_account" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "business_name" TEXT NOT NULL,
    "business_type" TEXT,
    "registration_number" TEXT,
    "tax_id" TEXT,
    "business_address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Philippines',
    "kyb_status" "KYBStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "kyb_submitted_at" TIMESTAMP(3),
    "kyb_reviewed_at" TIMESTAMP(3),
    "kyb_reviewed_by" UUID,
    "kyb_rejection_reason" TEXT,
    "business_registration_file_url" TEXT,
    "tax_certificate_file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "business_account_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "department" TEXT,
    "invitation_token" TEXT,
    "invitation_status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invited_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "description" TEXT,
    "price_monthly" DECIMAL(10,2) NOT NULL,
    "price_quarterly" DECIMAL(10,2),
    "price_yearly" DECIMAL(10,2),
    "features" TEXT[],
    "max_mail_items" INTEGER,
    "max_team_members" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "package_id" UUID,
    "plan_type" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "payment_method_id" TEXT,
    "next_billing_date" TIMESTAMP(3),
    "last_payment_date" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_item" (
    "id" UUID NOT NULL,
    "profile_id" UUID,
    "business_account_id" UUID,
    "sender" TEXT NOT NULL,
    "subject" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL,
    "status" "MailStatus" NOT NULL DEFAULT 'RECEIVED',
    "envelope_scan_url" TEXT,
    "full_scan_url" TEXT,
    "has_full_scan" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "category" TEXT,
    "notes" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "assigned_to" UUID,
    "department" TEXT,
    "requires_kyc_approval" BOOLEAN NOT NULL DEFAULT true,
    "kyc_approved_at" TIMESTAMP(3),
    "kyc_approved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_action_request" (
    "id" UUID NOT NULL,
    "mail_item_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "forward_address" TEXT,
    "forward_tracking_number" TEXT,
    "notes" TEXT,
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "approved_at" TIMESTAMP(3),
    "approved_by" UUID,
    "processed_at" TIMESTAMP(3),
    "processed_by" UUID,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_action_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_email_key" ON "profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_verification_profile_id_key" ON "kyc_verification"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_account_profile_id_key" ON "business_account"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_invitation_token_key" ON "team_member"("invitation_token");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_profile_id_business_account_id_key" ON "team_member"("profile_id", "business_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_plan_type_key" ON "package"("plan_type");

-- AddForeignKey
ALTER TABLE "kyc_verification" ADD CONSTRAINT "kyc_verification_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_account" ADD CONSTRAINT "business_account_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_business_account_id_fkey" FOREIGN KEY ("business_account_id") REFERENCES "business_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_item" ADD CONSTRAINT "mail_item_business_account_id_fkey" FOREIGN KEY ("business_account_id") REFERENCES "business_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_item" ADD CONSTRAINT "mail_item_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_action_request" ADD CONSTRAINT "mail_action_request_mail_item_id_fkey" FOREIGN KEY ("mail_item_id") REFERENCES "mail_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_action_request" ADD CONSTRAINT "mail_action_request_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
