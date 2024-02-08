"use client"
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SortingState } from "@tanstack/react-table";
import qs from "qs";
import { UUID } from "crypto";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from "moment-timezone";
import DataTable from "@/lib/components/datatable";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";


type GenerateColumnsProps = {
    onDeleteData?: () => void,
    permission: PermissionType
}

type FilterType = {
    search?: string
}

type PermissionType = {
    create: boolean,
    read: boolean,
    update: boolean,
    delete: boolean
}

type ContextMenuProps = {
    id: UUID,
    onDeleted?: () => void,
    permission: PermissionType
}

type TableProps = {
    permission: PermissionType,
}

const generateColumns = (props: GenerateColumnsProps) => ([
    {
        header: 'Kode Rekening',
        accessorKey: 'kode',
        cell: (data: any) => <p>{data.getValue()}</p>
    },
    {
        header: 'Nama ',
        accessorKey: 'name',
        cell: (data: any) => <p>{data.getValue()}</p>
    },
    {
        header: 'Tanggal Dibuat',
        accessorKey: 'createdAt',
        cell: (data: any) => (
            <p>
                {moment(data.getValue()).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm') + " WIB"}
            </p>
        )
    },
    {
        header: '',
        accessorKey: 'id',
        cell: (data: any) => (
            <ContextMenu id={data.getValue()} onDeleted={props.onDeleteData} permission={props.permission} />
        ),
        enableSorting: false
    }
]);

function ContextMenu({ id, onDeleted, permission }: ContextMenuProps): React.JSX.Element {
    if (!permission.update && !permission.delete && !permission.read) return <></>;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <Link
                    href={`/dashboard/rekening/edit/${id}`}
                >
                    <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Update
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => deleteData(id, onDeleted)}>
                    <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

async function deleteData(id: UUID, onDeleted?: () => void) {
    const confirm = withReactContent(Swal);
    const { isConfirmed } = await confirm.fire({
        icon: 'warning',
        title: "Hapus Data?",
        text: "Data yang dihapus tidak dapat dikembalikan",
        showCancelButton: true,
        confirmButtonText: 'Ya',
        confirmButtonColor: '#E53E3E',
        cancelButtonColor: '#2b6cb0',
        cancelButtonText: 'Batal'
    });

    if (!isConfirmed) return;
    

    confirm.fire({
        title: 'Mohon Tunggu',
        text: 'Sedang Menghapus Data',
        didOpen: async () => {
            confirm.showLoading();
        },
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false
    })

    const response_api = await fetch(`/api/rekening?rekeningId=${id}`, {
        method: 'DELETE'
    });

    let data = null;
    try {
        data = await response_api.json();
    } catch (error) {
        return confirm.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Terjadi Kesalahan Pada Server'
        })
    }

    if (data.status === 'success') {
        await confirm.fire({
            icon: data.status,
            title: data.message
        });

        onDeleted?.();
    } else {
        await confirm.fire({
            icon: data.status,
            title: data.error,
            text: data.message
        })
    }
}

export default function Table(props: TableProps) {
    const tableRef = useRef<typeof DataTable>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const pageParams = useMemo(() => {
        // @ts-ignore
        return new URLSearchParams(searchParams)
    }, [searchParams])

    let initialPage = searchParams.get('page') || 1;
    let initialPageSize = searchParams.get('pageSize') || 10;
    let initialSortColumn = searchParams.get('orderBy');
    let initialSortDirection = searchParams.get('orderDirection');
    let initialSort: SortingState = initialSortColumn && initialSortDirection ? [
        {
            id: initialSortColumn,
            desc: initialSortDirection != 'asc'
        }
    ] : [
        {
            id: 'name',
            desc: true
        }
    ];

    // PARSE FILTER STATE FROM URL START
    const [initialSearch, setInitialSearch] = useState(searchParams.get('search'));
    // PARSE FILTER STATE FROM URL END


    // SEARCH HANDLER START
    const [search, setSearch] = useState('');
    // SEARCH HANDLER END

    // FILTER STATE HANDLER START
    const [url, setUrl] = useState<undefined | URL>()

    useEffect(() => {
        const filter: FilterType = {}
        if (search) {
            filter.search = search;
            pageParams.set('search', search)
        } else {
            pageParams.delete('search')
        }

        let filterUrl = qs.stringify(filter)
        let url = filterUrl ? new URL(`${window.location.origin}/api/rekening?${filterUrl}`) : new URL(`${window.location.origin}/api/rekening`)
        router.replace(`${pathname}?${pageParams.toString()}`)

        let pendingRender = setTimeout(() => {
            setUrl(url)
        }, 100)

        return () => {
            clearTimeout(pendingRender);
        }

    }, [pageParams, pathname, router, search])
    // FILTER STATE HANDLER END

    // PARSE FILTER STATE FROM URL START
    useEffect(() => {
        if (initialSearch) {
            setSearch(initialSearch);
            setInitialSearch(null)
        }
    }, [initialSearch]);
    // PARSE FILTER STATE FROM URL END

    const refreshData = () => {
        // @ts-ignore
        tableRef.current?.reloadData();
    }

    return (
        <>
            <Separator />
            <Input
                placeholder={`Cari Nama Rekening, Kode Rekening..`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />
            <DataTable
                ref={tableRef}
                columns={generateColumns({ onDeleteData: refreshData, permission: props.permission })}
                url={url?.toString()}
                initialPageIndex={Number(initialPage) - 1}
                initialPageSize={Number(initialPageSize)}
                initialSorting={initialSort}
                onSortChange={(sortState) => {
                    let sort = sortState[0];
                    // @ts-ignore
                    const params = new URLSearchParams(searchParams);

                    if (sort) {
                        let column = sort.id;
                        let state = sort.desc ? 'desc' : 'asc';
                        params.set('orderBy', column);
                        params.set('orderDirection', state);
                    } else {
                        params.delete('orderBy');
                        params.delete('orderDirection');
                    }

                    router.replace(`${pathname}?${params.toString()}`)
                }}
                onPageChange={(pageIndex) => {
                    // @ts-ignore
                    const params = new URLSearchParams(searchParams);
                    params.set('page', pageIndex + 1 + '');
                    router.replace(`${pathname}?${params.toString()}`)
                }}
                onPageSizeChange={(pageSize) => {
                    // @ts-ignore
                    const params = new URLSearchParams(searchParams);
                    params.set('pageSize', pageSize + '');
                    router.replace(`${pathname}?${params.toString()}`)
                }}
            />
        </>
    );
}
