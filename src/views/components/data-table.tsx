'use client';

import {
  ColumnDef,
  flexRender,
  Table as TanTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/views/components/ui/table';

import { DataTablePagination } from './pagination';

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  table: TanTable<TData>;
};

export function DataTable<TData, TValue>({
  columns,
  table,
}: DataTableProps<TData, TValue>) {
  return (
    <div className="animate-slidein400 opacity-0 px-4 sm:px-6 py-5 flex flex-col gap-2">
      <div className="rounded-md dark:border-zinc-700 text-slate-900 dark:text-slate-200">
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
                  data-state={row.getIsSelected() && 'selected'}>
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
                  className="h-96 text-center">
                  Pelo visto, nenhum dado foi encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
