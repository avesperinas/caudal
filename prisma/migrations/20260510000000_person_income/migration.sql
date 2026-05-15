-- Crear nueva tabla SharedPersonIncome
CREATE TABLE "SharedPersonIncome" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "year"      INTEGER NOT NULL,
    "person"    INTEGER NOT NULL,
    "fromMonth" INTEGER NOT NULL,
    "toMonth"   INTEGER NOT NULL,
    "salary"    DOUBLE PRECISION NOT NULL,
    "extra"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SharedPersonIncome_pkey" PRIMARY KEY ("id")
);

-- Migrar datos existentes de SharedSalaryPeriod → SharedPersonIncome (una fila por persona)
INSERT INTO "SharedPersonIncome" ("id", "userId", "year", "person", "fromMonth", "toMonth", "salary", "extra", "createdAt")
SELECT
    gen_random_uuid()::text,
    "userId", "year", 1, "fromMonth", "toMonth", "person1Salary", "person1Extra", "createdAt"
FROM "SharedSalaryPeriod";

INSERT INTO "SharedPersonIncome" ("id", "userId", "year", "person", "fromMonth", "toMonth", "salary", "extra", "createdAt")
SELECT
    gen_random_uuid()::text,
    "userId", "year", 2, "fromMonth", "toMonth", "person2Salary", "person2Extra", "createdAt"
FROM "SharedSalaryPeriod";

-- Índice
CREATE INDEX "SharedPersonIncome_userId_year_idx" ON "SharedPersonIncome"("userId", "year");

-- Foreign key
ALTER TABLE "SharedPersonIncome" ADD CONSTRAINT "SharedPersonIncome_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Borrar tabla antigua
DROP TABLE "SharedSalaryPeriod";
