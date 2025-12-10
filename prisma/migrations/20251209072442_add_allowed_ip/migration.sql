-- CreateTable
CREATE TABLE "allowed_ip" (
    "id" UUID NOT NULL,
    "ip_address" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "allowed_ip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "allowed_ip_ip_address_key" ON "allowed_ip"("ip_address");
