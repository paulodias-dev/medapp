import { useAuth } from '@/app/context/use-auth';
import { clientService } from '@/app/services/client';
import { DataTable } from '@/views/components/data-table';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
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
import { Link } from 'react-router-dom';

import { columns } from './columns';

export function Certificates() {
  const { user } = useAuth();

  const {
    data: getAllExams,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['getAllExams', user?.id ?? 'anonymous'],
    queryFn: clientService.getAllExams,
    retry: 1,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const examsData = getAllExams || [];

  const table = useReactTable({
    data: examsData,
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
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Atestados
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Listagem de todos os ASO&apos;s da sua empresa.
            </p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
            {examsData.length} registros encontrados
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <section className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 px-4 sm:px-6 py-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Listagem de ASOs
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Consulte, filtre e acesse os detalhes dos atestados da empresa.
              </p>
            </div>

            <div className="flex w-full lg:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                className="h-10 w-full sm:w-72 rounded-xl border-slate-200 text-sm"
                placeholder="Pesquisar por colaborador..."
                onChange={(event) =>
                  table
                    .getColumn('patient_name')
                    ?.setFilterValue(event.target.value)
                }
              />
              <Button
                asChild
                variant="outline"
                className="rounded-xl h-10 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                <Link to="/certificate">Solicitar atestado</Link>
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="px-6 py-12 text-sm text-slate-400 text-center">
              Carregando atestados...
            </div>
          )}

          {isError && (
            <div className="px-6 py-12 text-center space-y-3">
              <p className="text-sm text-red-500">
                Não foi possível carregar a listagem de atestados.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading && !isError && <DataTable columns={columns} table={table} />}
        </section>
      </div>
    </div>
  );
}
