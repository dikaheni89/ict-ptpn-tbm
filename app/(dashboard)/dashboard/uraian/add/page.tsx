import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { validateAdminModuleAccess } from "@/lib/authHelper";
import Forbidden from "@/app/forbidden";
import BreadCrumb from "@/components/breadcrumb";
import FormDetailUraian from "../FormDetailUraian";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
    title: `Tambah Data Uraian Pekerjaan`,
    description: `Tambah Data Uraian Pekerjaan`
}

export default async function AddUraianPekerjaan() {
    const session = await getServerSession(AuthOptions) as ICustomSession;
    const isHasAccess = await validateAdminModuleAccess(session.id, 'Uraian Pekerjaan')
    
    if (!isHasAccess) {
        return <Forbidden />
    }

    const breadcrumbItems = [
        { title: "Uraian Pekerjaan", link: "/dashboard/uraian" },
        { title: "Create", link: "/dashboard/uraian/create" },
    ];

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
            />
        </div>
    )
}