import BreadCrumb from "@/components/breadcrumb";
import { UserClient } from "@/components/tables/user-tables/client";
import { getUserAdminModulePermission } from "@/lib/authHelper";
import { getServerSession } from "next-auth";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";

const breadcrumbItems = [{ title: "User", link: "/dashboard/user" }];
export default async function page() {
  const session = await getServerSession(AuthOptions) as ICustomSession;
  const permission = await getUserAdminModulePermission(session.id, 'Management User')

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <UserClient permission={permission} />
      </div>
    </>
  );
}
