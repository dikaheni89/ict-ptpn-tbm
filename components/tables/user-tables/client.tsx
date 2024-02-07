"use client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import Table from "@/components/tables/user-tables/table";

type PermissionType = {
  create: boolean,
  read: boolean,
  update: boolean,
  delete: boolean
}

interface UsersProps {
  permission: PermissionType
}

export const UserClient: React.FC<UsersProps> = ({ permission }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Users`}
          description="Management Users"
        />
        <Button
          className="text-xs md:text-sm bg-green-950"
          onClick={() => router.push(`/dashboard/user/add`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>
      <Separator />
      <Table permission={permission} />
    </>
  );
};
