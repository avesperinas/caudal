-- CreateEnum
CREATE TYPE "SharedAccessStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- AlterTable SharedAccountAccess: add status + updatedAt
ALTER TABLE "SharedAccountAccess" ADD COLUMN "status" "SharedAccessStatus" NOT NULL DEFAULT 'ACCEPTED';
ALTER TABLE "SharedAccountAccess" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Mark existing rows as ACCEPTED (they were already granted)
UPDATE "SharedAccountAccess" SET "status" = 'ACCEPTED';

-- CreateTable ArchivedCompartido
CREATE TABLE "ArchivedCompartido" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "reason" TEXT,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchivedCompartido_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArchivedCompartido" ADD CONSTRAINT "ArchivedCompartido_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
