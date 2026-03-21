import { dashboardService } from '@/app/services/dashboard';
import { DataTable } from '@/views/components/data-table';
import { Button } from '@/views/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/views/components/ui/card';
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
import { endOfDay } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { columns } from './columns';
import { AsoCompliance, AsoFindDialog } from './components';

export function Dashboard() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: warningExams,
    isLoading: warningExamsLoading,
    isError: warningExamsError,
  } = useQuery({
    queryKey: ['warningExams'],
    queryFn: dashboardService.warningExams,
    retry: false,
  });

  const {
    data: sumaryExams,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useQuery({
    queryKey: ['sumaryExams'],
    queryFn: dashboardService.sumaryExams,
    retry: false,
  });

  const warningExamsData = warningExams || [];
  const totalAsos = sumaryExams?.total_exams ?? 0;
  const activeAsos = sumaryExams?.active_exams ?? 0;
  const warningAsos = warningExamsData.length;
  const impactedPatients = new Set(warningExamsData.map((exam) => exam.patient_id))
    .size;

  const table = useReactTable({
    data: warningExamsData,
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

  const today = endOfDay(new Date());
  const dateLabel = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Page header */}
      <div className="border-b border-slate-100 bg-white px-4 sm:px-6">
        <div className="mx-auto max-w-7xl py-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Início
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium capitalize">
            {dateLabel}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">

        {/* Stats & Search Row */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="sm:col-span-2 flex flex-col justify-center border-slate-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black text-slate-900">Pesquisa global por ASO's</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed text-slate-500">
                Pesquise por ASO's de colaboradores da sua empresa.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <AsoFindDialog />
            </CardFooter>
          </Card>

          <AsoCompliance
            totalAsos={totalAsos}
            activeAsos={activeAsos}
            warningAsos={warningAsos}
            impactedPatients={impactedPatients}
            isLoading={summaryLoading || warningExamsLoading}
            hasError={summaryError || warningExamsError}
          />
        </div>

        {/* Warning Exams Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">ASOs vencidos</h2>
              <p className="text-sm text-slate-500 font-medium">
                Monitoramento de ASOs com vencimento superior a 12 meses.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Input
                className="max-w-64 h-10 rounded-xl border-slate-200 text-sm"
                placeholder="Pesquisar por colaborador..."
                onChange={(event) =>
                  table.getColumn('nome')?.setFilterValue(event.target.value)
                }
              />
              <Button
                asChild
                variant="outline"
                className="rounded-xl h-10 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <Link to="/certificates">Ver todos</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <DataTable table={table} columns={columns} />
          </div>
        </div>

      </div>
    </div>
  );
}
