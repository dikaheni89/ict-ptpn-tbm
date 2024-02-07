/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
"use client"
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ReactRef } from "@chakra-ui/react-utils";
import { useToast } from '../chakra-ui';
import Loading from '@/app/loading';


interface DataTableProps<TData extends object> {
  data?: TData[];
  columns: ColumnDef<TData>[];
  url?: URL | string;
  initialPageIndex?: number;
  initialPageSize?: number;
  initialSorting?: SortingState;
  onSortChange?: (sortingState: SortingState) => void
  onPageChange?: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

type FetchOptions = {
  url: URL | string,
  page: number,
  pageSize: number,
  sorting?: SortingState,
  onError?: (error: any) => void,
}

async function getData({ url, page, pageSize, sorting, onError }: FetchOptions) {
  const _url = new URL(url);
  _url.searchParams.set('page', page + '');
  _url.searchParams.set('pageSize', pageSize + '');

  let sort = sorting && sorting[0];
  if (sort) {
    let column = sort.id;
    let state = sort.desc ? 'desc' : 'asc';
    _url.searchParams.set('orderBy', column);
    _url.searchParams.set('orderDirection', state);
  } else {
    _url.searchParams.delete('orderBy');
    _url.searchParams.delete('orderDirection');
  }
  let response = null;

  try {
    let response_api = await fetch(_url);
    response = await response_api.json();
  } catch (e: any) {
    if (onError) {
      onError(e);
    } else {
      throw e;
    }
  }

  return response;
}

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const DataTable = <TData extends object>({
                                           url,
                                           columns,
                                           initialPageSize,
                                           initialPageIndex,
                                           initialSorting,
                                           onSortChange,
                                           onPageChange,
                                           onPageSizeChange,
                                           ...rest
                                         }: DataTableProps<TData>, ref: ReactRef<any>) => {
  const [sorting, setSorting] = useState<SortingState>(initialSorting || []);
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: initialPageIndex || 0,
    pageSize: initialPageSize || 10
  })
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [pageLength, setPageLength] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const toast = useToast();

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const table = useReactTable({
    data: data,
    columns,
    pageCount: pageLength,
    state: {
      pagination,
      sorting
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  })

  useImperativeHandle(ref, () => ({
    reloadData: async () => {
      if (url) {
        setIsLoading(true)
        try {
          let _data = await getData({
            url: url,
            page: pageIndex + 1,
            pageSize: pageSize,
            sorting: sorting,
            onError: () => {
              toast({
                title: 'Terjadi Kesalahan',
                description: 'Gagal Memuat Data',
                status: "error",
                isClosable: true,
                position: "top-right",
              });
            }
          });

          setData(_data.data.rows);
          setPageLength(Math.ceil(Math.ceil(_data.data.total_data / pageSize)))
          setTotalData(_data.data.total_data)
        } catch (e) {
          // silent error
        }
        setIsLoading(false)
      }
    }
  }))

  useCallback(async () => {
    if (url) {
      setIsLoading(true)
      try {
        let _data = await getData({
          url: url,
          page: pageIndex + 1,
          pageSize: pageSize,
          sorting,
          onError: () => {
            toast({
              title: 'Terjadi Kesalahan',
              description: 'Gagal Memuat Data',
              status: "error",
              isClosable: true,
              position: "top-right",
            });
          }
        });

        setData(_data.data.rows);
        setPageLength(Math.ceil(_data.data.total_data / pageSize))
        setTotalData(_data.data.total_data)
      } catch (e) {
        // silent error
      }
      setIsLoading(false)
    }
  }, [url, pageIndex, pageSize, sorting, toast]);

  // GET INITIAL DATA HANDLER START
  useEffect(() => {
    (async () => {
      if (url) {
        setIsLoading(true)
        try {


          let _data = await getData({
            url: url,
            page: pageIndex + 1,
            pageSize: pageSize,
            sorting: sorting,
            onError: () => {
              toast({
                title: 'Terjadi Kesalahan',
                description: 'Gagal Memuat Data',
                status: "error",
                isClosable: true,
                position: "top-right",
              });
            }
          });
          setData(_data.data.rows);
          setPageLength(Math.ceil(Math.ceil(_data.data.total_data / pageSize)))
          setTotalData(_data.data.total_data)
        } catch (e) {
          // silent error
        }
        setIsLoading(false)
      }
    })()
  }, [pageIndex, pageSize, url, sorting, toast])
  // GET INITIAL DATA HANDLER END

  // SORTING HANDLER START
  let prevSorting = usePrevious(sorting);
  useEffect(() => {
    if (prevSorting !== undefined && (JSON.stringify(prevSorting) !== JSON.stringify(sorting))) {
      if (onSortChange) {
        onSortChange(sorting);
      }
    }
  }, [sorting, prevSorting, onSortChange])
  // SORTING HANDLER END

  // PAGE CHANGE HANDLER START
  let prevPage = usePrevious(pageIndex);
  useEffect(() => {
    if (prevPage !== undefined && (JSON.stringify(prevPage) !== JSON.stringify(pageIndex))) {
      if (onPageChange) {
        onPageChange(pageIndex);
      }
    }
  }, [pageIndex, prevPage, onPageChange])
  // PAGE CHANGE HANDLER END

  // PAGE SIZE CHANGE HANDLER START
  let prevPageSize = usePrevious(pageSize);
  useEffect(() => {
    if (prevPageSize !== undefined && (JSON.stringify(prevPageSize) !== JSON.stringify(pageSize))) {
      if (onPageSizeChange) {
        onPageSizeChange(pageSize);
      }
    }
  }, [pageSize, prevPageSize, onPageSizeChange])
  // PAGE SIZE CHANGE HANDLER END

  const nilai = 0.66;
  return (
    <>
      <div className="rounded-md border" {...rest}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center align-middle"
                >
                  Tidak ada Data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
          <div className="flex items-center space-x-2">
            <p className="whitespace-nowrap text-sm font-medium">
              Rows per page
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default forwardRef(DataTable)
