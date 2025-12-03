/*
  Warnings:

  - You are about to drop the column `earnings` on the `referral` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `referral` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "referral" DROP COLUMN "earnings",
DROP COLUMN "status";
