-- Add publicToken column as nullable first
ALTER TABLE "Invoice" ADD COLUMN "publicToken" TEXT;

-- Generate tokens for existing records
UPDATE "Invoice" SET "publicToken" = lower(hex(randomblob(32))) WHERE "publicToken" IS NULL;

-- Now make it NOT NULL and unique
-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table
PRAGMA foreign_keys=OFF;

CREATE TABLE "Invoice_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pdfPath" TEXT,
    "publicToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "Invoice_new" SELECT * FROM "Invoice";

DROP TABLE "Invoice";
ALTER TABLE "Invoice_new" RENAME TO "Invoice";

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX "Invoice_publicToken_key" ON "Invoice"("publicToken");

PRAGMA foreign_keys=ON;
