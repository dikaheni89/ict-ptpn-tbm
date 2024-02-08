import Forbidden from "@/app/forbidden";
import BreadCrumb from "@/components/breadcrumb";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { validateAdminModuleAccess } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React from "react";
import FormDetailRekening from "../../FormDetailRekening";

export const metadata: Metadata = {
  title: `Edit Data Kode Rekening`,
  description: `Edit Data Kode Rekening`
}

export default async function EditKodeRekening({ params }: { params: { rekeningId: string } }) {
  const breadcrumbItems = [
    { title: "Kode Rekening", link: "/dashboard/rekening" },
    { title: "Edit", link: "/dashboard/rekening/edit" },
  ];

  const session = await getServerSession(AuthOptions) as ICustomSession;
  const isHasAccess = await validateAdminModuleAccess(session.id, 'Kode Rekening', 'UPDATE');
  if (!isHasAccess) {
    return <Forbidden/>
  }

  const rekening = await prisma.kodeReg.findFirst({
    where: {
      id: params.rekeningId
    }
  });

  if (!rekening) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <FormDetailRekening
        mode={'edit'}
        initialValues={{
          rekeningId: rekening.id,
          kode: rekening.kode,
          name: rekening.name,
        }}
      />      
    </div>
  );
}
