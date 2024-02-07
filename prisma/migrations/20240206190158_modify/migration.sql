/*
  Warnings:

  - A unique constraint covering the columns `[rek]` on the table `Pekerjaan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rek` to the `Pekerjaan` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Pekerjaan_koderegId_key";

-- AlterTable
ALTER TABLE "Pekerjaan" ADD COLUMN     "rek" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Pekerjaan_rek_key" ON "Pekerjaan"("rek");
