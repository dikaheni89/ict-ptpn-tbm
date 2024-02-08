import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { validateAdminModuleAccess } from "@/lib/authHelper";
import Forbidden from "@/app/forbidden";
import BreadCrumb from "@/components/breadcrumb";
import FormDetailRekening from "../FormDetailRekening";

export const metadata: Metadata = {
    title: `Tambah Data Kode Rekening`,
    description: `Tambah Data Kode Rekening`
}

export default async function AddKodeRekening() {
    const session = await getServerSession(AuthOptions) as ICustomSession;
    const isHasAccess = await validateAdminModuleAccess(session.id, 'Kode Rekening')
    
    if (!isHasAccess) {
        return <Forbidden />
    }

    const breadcrumbItems = [
        { title: "Kode Rekening", link: "/dashboard/rekening" },
        { title: "Create", link: "/dashboard/rekening/create" },
    ];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <BreadCrumb items={breadcrumbItems} />
            <FormDetailRekening />
        </div>
    )
}