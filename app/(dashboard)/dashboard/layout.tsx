import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { ICustomSession, options as AuthOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NavItem } from "@/types";

export const metadata: Metadata = {
  title: "Selamat Datang | Adminpanel ICT PTPN",
  description: "Selamat Datang PT. Perkebunan Nusantara",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await getServerSession(AuthOptions) as ICustomSession | null;
  if (!session) {
    redirect('/')
  }
  let modules = await prisma.user.findFirst({
    where: {
      id: session?.id
    },
    select: {
      group: {
        select: {
          userGroupAdminModule: {
            where: {
              read: true
            },
            orderBy: {
              module: {
                sort: 'asc'
              }
            },
            select: {
              module: {
                select: {
                  name: true,
                  url: true,
                  icon: true,
                  label: true
                }
              }
            }
          }
        }
      }
    }
  });

  const menus: Array<NavItem> = modules?.group?.userGroupAdminModule?.map(item => item.module) as NavItem[] || [];

  return (
    <>
      <Header dataMenu={menus} />
      <div className="flex h-screen overflow-hidden">
        <Sidebar dataMenu={menus} className="w-1/6 hidden md:block" />
        <main className="flex-1 pt-16 overflow-x-hidden overflow-y-auto ">
          {children}
        </main>
      </div>
    </>
  );
}
