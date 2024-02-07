/*
  Warnings:

  - A unique constraint covering the columns `[koderegId]` on the table `Pekerjaan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pekerjaan_koderegId_key" ON "Pekerjaan"("koderegId");
