import { ClinicalResultListItem } from '@/app/models';
import { Button } from '@/views/components/ui/button';
import { Badge } from '@/views/components/ui/badge';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';

import { Manage } from './manage';

function getStatusMeta(status: number) {
  if (status === 1) {
    return { label: 'Aprovado', variant: 'secondary' as const };
  }

  if (status === 0) {
    return { label: 'Pendente', variant: 'outline' as const };
  }

  return { label: 'Reprovado', variant: 'default' as const };
}

const sortableHeaderClass =
  'h-8 px-2 -ml-2 justify-start font-semibold text-slate-600 hover:bg-slate-100';

export const columns: ColumnDef<ClinicalResultListItem>[] = [
  {
    accessorKey: 'aso_number',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={sortableHeaderClass}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          ASO
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{row.original.aso_number ?? row.original.id}</div>;
    },
  },
  {
    accessorFn: (row) => row.patient?.name ?? '-',
    id: 'patient_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={sortableHeaderClass}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nome
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{row.original.patient?.name ?? '-'}</div>;
    },
  },
  {
    accessorFn: (row) => row.patient?.phone1 ?? '-',
    id: 'phone1',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={sortableHeaderClass}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Telefone
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{row.original.patient?.phone1 ?? '-'}</div>;
    },
  },
  {
    accessorFn: (row) => row.patient?.email ?? '-',
    id: 'patient_email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={sortableHeaderClass}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Email
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{row.original.patient?.email ?? '-'}</div>;
    },
  },
  {
    accessorFn: (row) => row.clinical_type_result?.name ?? '-',
    id: 'type_result_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={sortableHeaderClass}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Tipo
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{row.original.clinical_type_result?.name ?? '-'}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={sortableHeaderClass}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Status
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = Number(row.getValue('status'));
      const statusMeta = getStatusMeta(status);
      return (
        <Badge className="text-xs" variant={statusMeta.variant}>
          {statusMeta.label}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: () => {
      return <div className="text-center">Detalhes</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-4">
          <Manage exam={row.original} />
        </div>
      );
    },
  },
];
