"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types";
import { Dispatch, SetStateAction } from "react";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export function DashboardNav({ items, setOpen }: DashboardNavProps) {
  const path = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        const Icon = Icons[item.icon || "arrowRight"];
        return (
          item.url && (
            <Link
              key={index}
              href={item.disabled ? "/" : item.url}
              onClick={() => {
                if (setOpen) setOpen(false);
              }}
            >
              <span
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-green-foreground",
                  path === item.url ? "bg-green-950" : "transparent",
                  item.disabled && "cursor-not-allowed opacity-0",
                )}
              >
                <Icon className={cn(
                  "mr-2 h-4 w-4",
                  path === item.url ? "text-white": "text-black"
                )} />
                <span className={cn(
                  path === item.url ? "text-white" : "text-black"
                )}>{item.name}</span>
              </span>
            </Link>
          )
        );
      })}
    </nav>
  );
}
