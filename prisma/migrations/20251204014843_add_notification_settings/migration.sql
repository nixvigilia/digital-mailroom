-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "notify_marketing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notify_new_mail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_referrals" BOOLEAN NOT NULL DEFAULT true;
