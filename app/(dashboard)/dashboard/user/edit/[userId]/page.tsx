import Forbidden from "@/app/forbidden";
import BreadCrumb from "@/components/breadcrumb";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { validateAdminModuleAccess } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React from "react";
import FormDetailUser from "../../FormDetailUser";

export const metadata: Metadata = {
  title: `Edit Data User`,
  description: `Edit Data User`
}

export default async function EditUser({ params }: { params: { userId: string } }) {
  const breadcrumbItems = [
    { title: "User", link: "/dashboard/user" },
    { title: "Edit", link: "/dashboard/user/edit" },
  ];

  const session = await getServerSession(AuthOptions) as ICustomSession;
  const isHasAccess = await validateAdminModuleAccess(session.id, 'Management User', 'UPDATE');
  if (!isHasAccess) {
    return <Forbidden/>
  }

  const user = await prisma.user.findFirst({
    where: {
      id: params.userId
    }
  });

  if (!user) {
    return notFound();
  }

  const groups = await prisma.userGroup.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  });
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <FormDetailUser
        groups={groups}
        mode={'edit'}
        initialValues={{
          userId: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          group: user.groupId,
          status: user.status
        }}
      />      
    </div>
  );
}
