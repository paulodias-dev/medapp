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
import { endOfDay } from 'date-fns';
import { useState } from 'react';

import { columns } from './columns';

export function Certificates() {
  const { data: getAllExams } = useQuery({
    queryKey: ['getAllExams'],
    queryFn: clientService.getAllExams,
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
    <div>
      <div className="animate-slidein200 opacity-0 flex items-end justify-start gap-2 py-8 px-4 pb-6 border-b">
        <h1 className="text-3xl">Atestados</h1>
        <p className="text-sm text-zinc-400">
          {String(endOfDay(new Date()).getDate()).padStart(2, '0')}
        </p>
      </div>

      <hr className="border-b-[10px] border-[#f5f5f5]" />

      <DataTable columns={columns} table={table} />
    </div>
  );
}
