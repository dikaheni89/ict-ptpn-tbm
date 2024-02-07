/*
  Warnings:

  - Added the required column `icon` to the `AdminModule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `AdminModule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminModule" ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL;
