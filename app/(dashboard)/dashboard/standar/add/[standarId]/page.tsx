import Forbidden from "@/app/forbidden";
import BreadCrumb from "@/components/breadcrumb";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { validateAdminModuleAccess } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React from "react";
import FormAddPekerjaan from "@/app/(dashboard)/dashboard/standar/FormAddPekerjaan";
import { bulans, caturwulans, jenis, minggus } from "@/constants/data";

export const metadata: Metadata = {
  title: `Tambah Data Standar Fisik`,
  description: `Tambah Data Standar Fisik`
}

export default async function TambahStandar({ params }: { params: { standarId: string } }) {
  const breadcrumbItems = [
    { title: "Standar Fisik", link: "/dashboard/standar" },
    { title: "Tambah Data", link: "/dashboard/standar/add" },
  ];

  const session = await getServerSession(AuthOptions) as ICustomSession;
  const isHasAccess = await validateAdminModuleAccess(session.id, 'Standar Fisik', 'UPDATE');
  if (!isHasAccess) {
    return <Forbidden/>
  }

  const pekerjaans = await prisma.pekerjaan.findFirst({
    where: {
      id: params.standarId
    }
  });

  if (!pekerjaans) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      <FormAddPekerjaan
        caturwulan={caturwulans}
        bulan={bulans}
        minggu={minggus}
        jenis={jenis}
        pekerjaanId={pekerjaans.id}
      />
    </div>
  );
}
