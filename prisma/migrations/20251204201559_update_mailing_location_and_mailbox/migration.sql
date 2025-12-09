-- CreateEnum
CREATE TYPE "MailboxType" AS ENUM ('STANDARD', 'LARGE', 'PARCEL_LOCKER');

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "mailbox_id" UUID,
ADD COLUMN     "mailing_location_id" UUID;

-- CreateTable
CREATE TABLE "mailing_location" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Philippines',
    "image_url" TEXT,
    "map_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mailing_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mailbox" (
    "id" UUID NOT NULL,
    "mailing_location_id" UUID NOT NULL,
    "box_number" TEXT NOT NULL,
    "type" "MailboxType" NOT NULL DEFAULT 'STANDARD',
    "width" DECIMAL(10,2) NOT NULL,
    "height" DECIMAL(10,2) NOT NULL,
    "depth" DECIMAL(10,2) NOT NULL,
    "is_occupied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mailbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mailbox_mailing_location_id_box_number_key" ON "mailbox"("mailing_location_id", "box_number");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_mailing_location_id_fkey" FOREIGN KEY ("mailing_location_id") REFERENCES "mailing_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_mailbox_id_fkey" FOREIGN KEY ("mailbox_id") REFERENCES "mailbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailbox" ADD CONSTRAINT "mailbox_mailing_location_id_fkey" FOREIGN KEY ("mailing_location_id") REFERENCES "mailing_location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
