import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { UserNav } from "./user-nav";
import { NavItem } from "@/types";
import Image from "next/image";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dataMenu: NavItem[]
}
export default function Header({ dataMenu }: HeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image src="/static/logo/logo.png" alt="logo" width={100} height={20} />
          PT. Perkebunan Nusantara
        </div>
        <div className={cn("block sm:!hidden")}>
          <MobileSidebar dataMenu={dataMenu} />
        </div>

        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </nav>
    </div>
  );
}
