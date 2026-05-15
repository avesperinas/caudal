-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('FIFTY_FIFTY', 'PROPORTIONAL');

-- CreateEnum
CREATE TYPE "SharedPayer" AS ENUM ('ACCOUNT', 'PERSON1', 'PERSON2');

-- CreateTable
CREATE TABLE "SharedYearConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "person1Name" TEXT NOT NULL DEFAULT 'Persona 1',
    "person2Name" TEXT NOT NULL DEFAULT 'Persona 2',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedYearConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedSalaryPeriod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fromMonth" INTEGER NOT NULL,
    "toMonth" INTEGER NOT NULL,
    "person1Salary" DOUBLE PRECISION NOT NULL,
    "person2Salary" DOUBLE PRECISION NOT NULL,
    "person1Extra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "person2Extra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedSalaryPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "splitType" "SplitType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedExpense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidBy" "SharedPayer" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedDeposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "person" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedYearConfig_userId_year_key" ON "SharedYearConfig"("userId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "SharedCategory_userId_name_key" ON "SharedCategory"("userId", "name");

-- AddForeignKey
ALTER TABLE "SharedYearConfig" ADD CONSTRAINT "SharedYearConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedSalaryPeriod" ADD CONSTRAINT "SharedSalaryPeriod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedCategory" ADD CONSTRAINT "SharedCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedExpense" ADD CONSTRAINT "SharedExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedExpense" ADD CONSTRAINT "SharedExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SharedCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedDeposit" ADD CONSTRAINT "SharedDeposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
