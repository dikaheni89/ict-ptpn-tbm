/*
  Warnings:

  - Added the required column `jenis` to the `LuasTbm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minggu` to the `LuasTbm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LuasTbm" ADD COLUMN     "jenis" TEXT NOT NULL,
ADD COLUMN     "minggu" TEXT NOT NULL;
