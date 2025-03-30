import { dashboardService } from '@/app/services/dashboard';
import { DataTable } from '@/views/components/data-table';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

import { columns } from './columns';
import { AsoCompliance, AsoFindDialog } from './components';

export function Dashboard() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: warningExams } = useQuery({
    queryKey: ['warningExams'],
    queryFn: dashboardService.warningExams,
  });

  const table = useReactTable({
    data: warningExams || [],
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
    <div>
      <div className="animate-slidein200 opacity-0 flex items-end justify-start gap-2 py-8 px-4 pb-6 border-b">
        <h1 className="text-3xl">Início</h1>
        <p className="text-sm text-zinc-400">
          {String(endOfDay(new Date()).getDate()).padStart(2, '0')}
        </p>
      </div>

      <hr className="border-b-[10px] border-[#f5f5f5]" />

      <main className="animate-slidein600 opacity-0 grid flex-1 items-start gap-4 p-4 sm:px-4 md:gap-8 xl:grid-cols-2">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-6">
            <Card
              className="sm:col-span-2 flex flex-col justify-center"
              x-chunk="dashboard-05-chunk-0">
              <CardHeader className="pb-3">
                <CardTitle>Pesquisa global por ASO's</CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                  Pesquise por ASO's de colaboradores da sua empresa.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <AsoFindDialog />
              </CardFooter>
            </Card>

            <AsoCompliance />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium">Exames com alterações</h1>
              <p className="font-normal text-gray-400">
                Exames com alterações identificados para atenção imediata.
              </p>
            </div>

            <Input
              className="max-w-64"
              placeholder="Pesquisar por atestado..."
              onChange={(event) =>
                table.getColumn('name')?.setFilterValue(event.target.value)
              }
            />
          </div>
        </div>
      </main>

      <DataTable table={table} columns={columns} />
    </div>
  );
}
