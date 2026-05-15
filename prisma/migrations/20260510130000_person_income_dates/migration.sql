-- Añadir columnas de fecha con valor temporal
ALTER TABLE "SharedPersonIncome"
  ADD COLUMN "fromDate" DATE NOT NULL DEFAULT '2024-01-01',
  ADD COLUMN "toDate"   DATE NOT NULL DEFAULT '2024-12-31';

-- Migrar datos: fromMonth → primer día del mes, toMonth → último día del mes
UPDATE "SharedPersonIncome"
SET
  "fromDate" = make_date("year", "fromMonth", 1),
  "toDate"   = (make_date("year", "toMonth", 1) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

-- Eliminar columnas antiguas
ALTER TABLE "SharedPersonIncome"
  DROP COLUMN "fromMonth",
  DROP COLUMN "toMonth";
