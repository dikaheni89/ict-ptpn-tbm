import { DashboardNav } from "@/components/dashboard-nav";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  dataMenu: NavItem[]
}

export default async function Sidebar({ className, dataMenu }: SidebarProps) {

  return (
    <div className={cn("py-16 border", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Overview
          </h2>
            <div className="space-y-1">
              <DashboardNav items={dataMenu} />
            </div>
        </div>
      </div>
    </div>
  );
}