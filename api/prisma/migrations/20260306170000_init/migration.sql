-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "BoardStatus" AS ENUM ('unclaimed', 'active', 'stolen', 'transferred');
CREATE TYPE "ClaimType" AS ENUM ('claim', 'transfer');
CREATE TYPE "MessageStatus" AS ENUM ('new', 'forwarded', 'read', 'archived');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BoardModel" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BoardModel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BoardVariant" (
  "id" TEXT NOT NULL,
  "boardModelId" TEXT NOT NULL,
  "sizeCm" INTEGER NOT NULL,
  "widthCm" DOUBLE PRECISION,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BoardVariant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Board" (
  "id" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "serialNumber" TEXT NOT NULL,
  "boardVariantId" TEXT NOT NULL,
  "ownerUserId" TEXT,
  "status" "BoardStatus" NOT NULL DEFAULT 'unclaimed',
  "publicUrl" TEXT NOT NULL,
  "hash" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "productionYear" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BoardClaim" (
  "id" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "ClaimType" NOT NULL,
  "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt" TIMESTAMP(3),
  CONSTRAINT "BoardClaim_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScanLog" (
  "id" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userAgent" TEXT,
  "ip" TEXT,
  "source" TEXT,
  CONSTRAINT "ScanLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactMessage" (
  "id" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "senderEmail" TEXT,
  "senderPhone" TEXT,
  "message" TEXT NOT NULL,
  "locationText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "forwardedAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3),
  "status" "MessageStatus" NOT NULL DEFAULT 'new',
  CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteContent" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "BoardModel_code_key" ON "BoardModel"("code");
CREATE UNIQUE INDEX "BoardVariant_boardModelId_sizeCm_key" ON "BoardVariant"("boardModelId", "sizeCm");
CREATE UNIQUE INDEX "Board_publicId_key" ON "Board"("publicId");
CREATE UNIQUE INDEX "Board_serialNumber_key" ON "Board"("serialNumber");
CREATE UNIQUE INDEX "SiteContent_key_key" ON "SiteContent"("key");

CREATE INDEX "Board_ownerUserId_idx" ON "Board"("ownerUserId");
CREATE INDEX "Board_status_idx" ON "Board"("status");
CREATE INDEX "BoardClaim_boardId_claimedAt_idx" ON "BoardClaim"("boardId", "claimedAt");
CREATE INDEX "ScanLog_boardId_scannedAt_idx" ON "ScanLog"("boardId", "scannedAt");
CREATE INDEX "ContactMessage_boardId_createdAt_idx" ON "ContactMessage"("boardId", "createdAt");

-- Foreign Keys
ALTER TABLE "BoardVariant" ADD CONSTRAINT "BoardVariant_boardModelId_fkey"
FOREIGN KEY ("boardModelId") REFERENCES "BoardModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Board" ADD CONSTRAINT "Board_boardVariantId_fkey"
FOREIGN KEY ("boardVariantId") REFERENCES "BoardVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Board" ADD CONSTRAINT "Board_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BoardClaim" ADD CONSTRAINT "BoardClaim_boardId_fkey"
FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BoardClaim" ADD CONSTRAINT "BoardClaim_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_boardId_fkey"
FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_boardId_fkey"
FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
