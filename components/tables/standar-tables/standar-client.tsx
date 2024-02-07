"use client"

import React from "react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Table from "@/components/tables/standar-tables/table";

type PermissionType = {
  create: boolean,
  read: boolean,
  update: boolean,
  delete: boolean
}

interface PekerjaanProps {
  permission: PermissionType,
  kodeReg: {
    id: string,
    kode: string,
    name: string
  }[]
}

export const StandarClient: React.FC<PekerjaanProps> = ({ permission, kodeReg }) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const selectKode = kodeReg.map(data => {
    return { value: data.id, label: `Nomor : ${data.kode} - ${data.name}`}
  })

  const handleClick = (clickValue: string) => {
    setValue(clickValue === value ? "" : clickValue);
    setOpen(false);
  }
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Standar Fisik`}
          description="Management Standar Fisik"
        />
      </div>
      <Separator />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[700px] justify-between"
          >
            {value ? selectKode.find((selectkode) => selectkode.value === value)?.label : "Pilih Kode Rekening..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[700px] p-0">
          <Command>
            <CommandInput placeholder="Pilih Kode Rekening Standar Fisik..." />
            <CommandEmpty>Tidak Ada Pilihan Kode Rekening Tersebut</CommandEmpty>
            <CommandGroup>
              {selectKode.map((selectkode) => (
                <CommandItem
                  key={selectkode.value}
                  value={selectkode.value}
                  onSelect={handleClick}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === selectkode.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {selectkode.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Separator />
      {value ? (
        <>
          <Table permission={permission} idreg={value} />
        </>
      ) : (
        <>
          <div className="flex justify-center">
            <p>Belum ada data yang di pilih.</p>
          </div>
        </>
      )}
    </>
  );
}