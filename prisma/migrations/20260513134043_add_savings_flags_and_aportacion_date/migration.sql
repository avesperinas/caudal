-- AlterTable
ALTER TABLE "PersonalCategory" ADD COLUMN     "countForExtendedSavings" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PersonalTransaction" ADD COLUMN     "date" DATE,
ADD COLUMN     "madeByMe" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "countForSavings" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SharedPersonIncome" ALTER COLUMN "fromDate" DROP DEFAULT,
ALTER COLUMN "toDate" DROP DEFAULT;
