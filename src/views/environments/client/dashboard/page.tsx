import { useAuth } from '@/app/context/use-auth';
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
  const { user } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: warningExams,
    isLoading: warningExamsLoading,
    isError: warningExamsError,
    refetch: refetchWarningExams,
  } = useQuery({
    queryKey: ['warningExams', user?.id ?? 'anonymous'],
    queryFn: dashboardService.warningExams,
    retry: false,
  });

  const {
    data: sumaryExams,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['sumaryExams', user?.id ?? 'anonymous'],
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
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Início
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 text-sm capitalize">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {dateLabel}
            </p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
            {warningAsos} ASOs vencidos para revisão
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Card className="md:col-span-2 xl:col-span-2 flex h-full flex-col justify-center border-slate-100 shadow-sm rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-black text-slate-900">
                Pesquisa global por ASO&apos;s
              </CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed text-slate-500">
                Pesquise rapidamente por ASO&apos;s de colaboradores da sua
                empresa.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
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

        <section className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 px-4 sm:px-6 py-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">ASOs vencidos</h2>
              <p className="text-sm text-slate-500 font-medium">
                Monitoramento de ASOs com vencimento superior a 12 meses.
              </p>
            </div>

            <div className="flex w-full lg:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                className="h-10 w-full sm:w-72 rounded-xl border-slate-200 text-sm"
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

          {warningExamsLoading && (
            <div className="px-6 py-12 text-sm text-slate-400 text-center">
              Carregando ASOs vencidos...
            </div>
          )}

          {warningExamsError && (
            <div className="px-6 py-12 text-center space-y-3">
              <p className="text-sm text-red-500">
                Não foi possível carregar o monitoramento de ASOs vencidos.
              </p>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => {
                  void refetchWarningExams();
                  void refetchSummary();
                }}>
                Tentar novamente
              </Button>
            </div>
          )}

          {!warningExamsLoading && !warningExamsError && (
            <DataTable table={table} columns={columns} />
          )}
        </section>
      </div>
    </div>
  );
}
