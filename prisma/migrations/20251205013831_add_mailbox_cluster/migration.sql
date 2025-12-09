/*
  Warnings:

  - You are about to drop the column `mailing_location_id` on the `mailbox` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cluster_id,box_number]` on the table `mailbox` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cluster_id` to the `mailbox` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DimensionUnit" AS ENUM ('CM', 'INCH');

-- DropForeignKey
ALTER TABLE "mailbox" DROP CONSTRAINT "mailbox_mailing_location_id_fkey";

-- DropIndex
DROP INDEX "mailbox_mailing_location_id_box_number_key";

-- AlterTable
ALTER TABLE "mailbox" DROP COLUMN "mailing_location_id",
ADD COLUMN     "cluster_id" UUID NOT NULL,
ADD COLUMN     "dimension_unit" "DimensionUnit" NOT NULL DEFAULT 'CM';

-- CreateTable
CREATE TABLE "mailbox_cluster" (
    "id" UUID NOT NULL,
    "mailing_location_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mailbox_cluster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mailbox_cluster_mailing_location_id_name_key" ON "mailbox_cluster"("mailing_location_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "mailbox_cluster_id_box_number_key" ON "mailbox"("cluster_id", "box_number");

-- AddForeignKey
ALTER TABLE "mailbox_cluster" ADD CONSTRAINT "mailbox_cluster_mailing_location_id_fkey" FOREIGN KEY ("mailing_location_id") REFERENCES "mailing_location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailbox" ADD CONSTRAINT "mailbox_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "mailbox_cluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
