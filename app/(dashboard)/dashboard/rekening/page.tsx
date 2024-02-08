import { getServerSession } from "next-auth";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { getUserAdminModulePermission } from "@/lib/authHelper";
import BreadCrumb from "@/components/breadcrumb";
import { RekeningClient } from "@/components/tables/rekening-tables/rekening-client";

const breadcrumbItems = [{ title: "Rekening", link: "/dashboard/rekening" }];

export default async function page() {
    const session = await getServerSession(AuthOptions) as ICustomSession;
    const permission = await getUserAdminModulePermission(session.id, 'Kode Rekening')

    return (
        <>
            <div className={"flex-1 space-y-4  p-4 md:p-8 pt-6"}>
                <BreadCrumb items={breadcrumbItems} />
                <RekeningClient permission={permission} />
            </div>
        </>
    );
}