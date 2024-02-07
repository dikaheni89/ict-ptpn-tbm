import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { validateAdminModuleAccess } from "@/lib/authHelper";
import Forbidden from "@/app/forbidden";
import { prisma } from "@/lib/prisma";
import FormDetailUser from "../FormDetailUser";
import BreadCrumb from "@/components/breadcrumb";

export const metadata: Metadata = {
    title: `Tambah Data User`,
    description: `Tambah Data User`
}

export default async function AddUser() {
    const session = await getServerSession(AuthOptions) as ICustomSession;
    const isHasAccess = await validateAdminModuleAccess(session.id, 'Management User')
    
    if (!isHasAccess) {
        return <Forbidden />
    }

    const groups = await prisma.userGroup.findMany({
        select: {
            id: true,
            name: true
        },
        orderBy: {
            name: 'asc'
        }
    })

    const breadcrumbItems = [
        { title: "User", link: "/dashboard/user" },
        { title: "Create", link: "/dashboard/user/create" },
    ];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <BreadCrumb items={breadcrumbItems} />
            <FormDetailUser 
                groups={groups} 
            />
        </div>
    )
}