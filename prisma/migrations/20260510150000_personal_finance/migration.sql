CREATE TYPE "PersonalCategoryType" AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE "PersonalTransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

CREATE TABLE "PersonalCategory" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "type"      "PersonalCategoryType" NOT NULL,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PersonalCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PersonalTransaction" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "year"       INTEGER NOT NULL,
  "month"      INTEGER NOT NULL,
  "amount"     DOUBLE PRECISION NOT NULL,
  "type"       "PersonalTransactionType" NOT NULL,
  "categoryId" TEXT,
  "productId"  TEXT,
  "note"       TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PersonalTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PersonalCategory_userId_idx" ON "PersonalCategory"("userId");
CREATE INDEX "PersonalTransaction_userId_year_idx" ON "PersonalTransaction"("userId", "year");

ALTER TABLE "PersonalCategory"    ADD CONSTRAINT "PersonalCategory_userId_fkey"    FOREIGN KEY ("userId")    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalTransaction" ADD CONSTRAINT "PersonalTransaction_userId_fkey"   FOREIGN KEY ("userId")    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalTransaction" ADD CONSTRAINT "PersonalTransaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PersonalCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PersonalTransaction" ADD CONSTRAINT "PersonalTransaction_productId_fkey"  FOREIGN KEY ("productId")  REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
