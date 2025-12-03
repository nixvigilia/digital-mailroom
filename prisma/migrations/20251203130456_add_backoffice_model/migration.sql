-- CreateTable
CREATE TABLE "backoffice_profile" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backoffice_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "backoffice_profile_profile_id_key" ON "backoffice_profile"("profile_id");

-- AddForeignKey
ALTER TABLE "backoffice_profile" ADD CONSTRAINT "backoffice_profile_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
