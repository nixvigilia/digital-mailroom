-- AlterTable
ALTER TABLE "mail_item" ADD COLUMN     "mailbox_id" UUID;

-- AddForeignKey
ALTER TABLE "mail_item" ADD CONSTRAINT "mail_item_mailbox_id_fkey" FOREIGN KEY ("mailbox_id") REFERENCES "mailbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;
