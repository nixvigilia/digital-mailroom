/*
  Warnings:

  - You are about to drop the column `full_name` on the `profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referral_code]` on the table `profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "profile" DROP COLUMN "full_name",
ADD COLUMN     "referral_code" TEXT,
ADD COLUMN     "referred_by" UUID;

-- CreateTable
CREATE TABLE "referral" (
    "id" UUID NOT NULL,
    "referrer_id" UUID NOT NULL,
    "referred_id" UUID NOT NULL,
    "referral_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "earnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subscription_plan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_referred_id_key" ON "referral"("referred_id");

-- CreateIndex
CREATE INDEX "referral_referrer_id_idx" ON "referral"("referrer_id");

-- CreateIndex
CREATE INDEX "referral_referral_code_idx" ON "referral"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "profile_referral_code_key" ON "profile"("referral_code");

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
