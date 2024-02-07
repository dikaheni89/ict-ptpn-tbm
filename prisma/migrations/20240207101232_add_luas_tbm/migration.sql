-- CreateTable
CREATE TABLE "LuasTbm" (
    "id" TEXT NOT NULL,
    "pekerjaanId" TEXT NOT NULL,
    "caturwulan" TEXT NOT NULL,
    "bulan" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LuasTbm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LuasTbm" ADD CONSTRAINT "LuasTbm_pekerjaanId_fkey" FOREIGN KEY ("pekerjaanId") REFERENCES "Pekerjaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
