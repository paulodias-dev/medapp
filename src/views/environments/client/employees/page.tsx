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

export function Employees() {
  const { user } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: patientsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['clientPatients', user?.id ?? 'anonymous'],
    queryFn: () => clientService.getPatientsList({ per_page: 200 }),
    retry: 1,
  });

  const patients = patientsData ?? [];

  const table = useReactTable({
    data: patients,
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
              Colaboradores
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Lista de pacientes vinculados à sua empresa.
            </p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
            {patients.length} colaboradores
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <section className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 px-4 sm:px-6 py-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Listagem de colaboradores
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Consulte os dados de contato dos colaboradores vinculados.
              </p>
            </div>

            <div className="flex w-full lg:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                className="h-10 w-full sm:w-72 rounded-xl border-slate-200 text-sm"
                placeholder="Pesquisar por nome..."
                onChange={(event) =>
                  table.getColumn('name')?.setFilterValue(event.target.value)
                }
              />
              <Button
                asChild
                variant="outline"
                className="rounded-xl h-10 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                <Link to="/certificate/date">Solicitar exame</Link>
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="px-6 py-12 text-sm text-slate-400 text-center">
              Carregando colaboradores...
            </div>
          )}

          {isError && (
            <div className="px-6 py-12 text-center space-y-3">
              <p className="text-sm text-red-500">
                Não foi possível carregar a listagem de colaboradores.
              </p>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !isError && <DataTable columns={columns} table={table} />}
        </section>
      </div>
    </div>
  );
}
