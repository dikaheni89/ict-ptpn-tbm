import Forbidden from "@/app/forbidden";
import BreadCrumb from "@/components/breadcrumb";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { validateAdminModuleAccess } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React from "react";
import FormDetailUraian from "../../FormDetailUraian";

export const metadata: Metadata = {
  title: `Edit Data Urain Pekerjaan`,
  description: `Edit Data Uraian Pekerjaan`
}

export default async function EditUraianPekerjaan({ params }: { params: { pekerjaanId: string } }) {
  const breadcrumbItems = [
    { title: "Uraian Pekerjaan", link: "/dashboard/uraian" },
    { title: "Edit", link: "/dashboard/uraian/edit" },
  ];

  const session = await getServerSession(AuthOptions) as ICustomSession;
  const isHasAccess = await validateAdminModuleAccess(session.id, 'Uraian Pekerjaan', 'UPDATE');
  if (!isHasAccess) {
    return <Forbidden/>
  }

  const pekerjaan = await prisma.pekerjaan.findFirst({
    where: {
      id: params.pekerjaanId
    }
  });

  if (!pekerjaan) {
    return notFound();
  }

  const kodeRek = await prisma.kodeReg.findMany({
    select: {
        id: true,
        name: true
    },
    orderBy: {
        kode: 'asc'
    }
})

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <FormDetailUraian
        kodeRegs={kodeRek}
        mode={'edit'}
        initialValues={{
          pekerjaanId: pekerjaan.id,
          kodereg: pekerjaan.koderegId,
          rek: pekerjaan.rek,
          uraian: pekerjaan.uraian,
          fisik: pekerjaan.fisik,
          norma: pekerjaan.norma,
          rotasi: pekerjaan.rotasi,
          keterangan: pekerjaan.keterangan,
        }}
      />      
    </div>
  );
}
