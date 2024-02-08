"use client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import Table from "@/components/tables/uraian-tables/table";

type PermissionType = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

interface UsersProps {
  permission: PermissionType;
}

export const UraianClient: React.FC<UsersProps> = ({ permission }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Uraian Pekerjaan`} description="Management Uraian Pekerjaan" />
        <Button
          className="text-xs md:text-sm bg-green-950"
          onClick={() => router.push(`/dashboard/uraian/add`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>
      <Table permission={permission} />
    </>
  );
};
