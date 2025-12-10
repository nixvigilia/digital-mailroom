-- AlterTable
ALTER TABLE "package" ADD COLUMN     "max_scanned_pages" INTEGER,
ADD COLUMN     "max_storage_items" INTEGER,
ADD COLUMN     "retention_days" INTEGER;
