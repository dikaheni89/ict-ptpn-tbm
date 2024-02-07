/*
  Warnings:

  - A unique constraint covering the columns `[uraian]` on the table `Pekerjaan` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Pekerjaan_rek_key";

-- CreateIndex
CREATE UNIQUE INDEX "Pekerjaan_uraian_key" ON "Pekerjaan"("uraian");
