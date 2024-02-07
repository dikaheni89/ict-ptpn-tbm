import BreadCrumb from "@/components/breadcrumb";
import { StandarClient } from "@/components/tables/standar-tables/standar-client";
import { getServerSession } from "next-auth";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { getUserAdminModulePermission } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";

const breadcrumbItems = [{ title: "Standar Fisik", link: "/dashboard/standar" }];

export default async function page() {
  const session = await getServerSession(AuthOptions) as ICustomSession;
  const permission = await getUserAdminModulePermission(session.id, 'Standar Fisik')

  const kodeReg = await prisma.kodeReg.findMany({
    select: {
      id: true,
      kode: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
      <>
        <div className={"flex-1 space-y-4  p-4 md:p-8 pt-6"}>
          <BreadCrumb items={breadcrumbItems} />
          <StandarClient kodeReg={kodeReg} permission={permission}  />
        </div>
      </>
  );
}