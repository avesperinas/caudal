-- CreateTable
CREATE TABLE "SharedAccountAccess" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "collaboratorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedAccountAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedAccountAccess_ownerUserId_collaboratorUserId_key" ON "SharedAccountAccess"("ownerUserId", "collaboratorUserId");

-- AddForeignKey
ALTER TABLE "SharedAccountAccess" ADD CONSTRAINT "SharedAccountAccess_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedAccountAccess" ADD CONSTRAINT "SharedAccountAccess_collaboratorUserId_fkey" FOREIGN KEY ("collaboratorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
