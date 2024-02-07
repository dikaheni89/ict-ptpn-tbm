-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'BLOCKING', 'DISABLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'DISABLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroupAdminModule" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "create" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "update" BOOLEAN NOT NULL DEFAULT false,
    "delete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "UserGroupAdminModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminModule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AdminModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KodeReg" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KodeReg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pekerjaan" (
    "id" TEXT NOT NULL,
    "koderegId" TEXT NOT NULL,
    "uraian" TEXT NOT NULL,
    "fisik" TEXT NOT NULL,
    "norma" TEXT NOT NULL,
    "rotasi" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pekerjaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itensitas" (
    "id" TEXT NOT NULL,
    "rata" TEXT NOT NULL,
    "jurangan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Itensitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminModule_name_key" ON "AdminModule"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AdminModule_url_key" ON "AdminModule"("url");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroup_name_key" ON "UserGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KodeReg_kode_key" ON "KodeReg"("kode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "UserGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupAdminModule" ADD CONSTRAINT "UserGroupAdminModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "AdminModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupAdminModule" ADD CONSTRAINT "UserGroupAdminModule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "UserGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pekerjaan" ADD CONSTRAINT "Pekerjaan_koderegId_fkey" FOREIGN KEY ("koderegId") REFERENCES "KodeReg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
