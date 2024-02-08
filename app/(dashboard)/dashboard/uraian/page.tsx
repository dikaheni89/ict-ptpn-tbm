import { getServerSession } from "next-auth";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { getUserAdminModulePermission } from "@/lib/authHelper";
import BreadCrumb from "@/components/breadcrumb";
import { UraianClient } from "@/components/tables/uraian-tables/uraian-client";

const breadcrumbItems = [{ title: "Uraian Pekerjaan", link: "/dashboard/uraian" }];

export default async function page() {
    const session = await getServerSession(AuthOptions) as ICustomSession;
    const permission = await getUserAdminModulePermission(session.id, 'Uraian Pekerjaan')

    return (
        <>
            <div className={"flex-1 space-y-4  p-4 md:p-8 pt-6"}>
                <BreadCrumb items={breadcrumbItems} />
                <UraianClient permission={permission} />
            </div>
        </>
    );
}