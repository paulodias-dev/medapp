import { clientService } from '@/app/services/client';
import { DataTable } from '@/views/components/data-table';
import { useQuery } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

import { columns } from './columns';

export function Certificates() {
  const {
    data: getAllExams,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['getAllExams'],
    queryFn: clientService.getAllExams,
    retry: false,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: getAllExams || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Page header */}
      <div className="border-b border-slate-100 bg-white px-4 sm:px-6">
        <div className="mx-auto max-w-7xl py-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Atestados</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Listagem de todos os ASO's da sua empresa.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          {isLoading && (
            <div className="px-6 py-12 text-sm text-slate-400 text-center">
              Carregando atestados...
            </div>
          )}

          {isError && (
            <div className="px-6 py-12 text-sm text-red-500 text-center">
              Não foi possível carregar a listagem de atestados.
            </div>
          )}

          {!isLoading && !isError && <DataTable columns={columns} table={table} />}
        </div>
      </div>
    </div>
  );
}

