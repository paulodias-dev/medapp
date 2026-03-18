import { Button } from '@/views/components/ui/button';
import { Badge } from '@/views/components/ui/badge';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';

import { Manage } from './manage';

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'aso_number',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          ASO
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="px-3">{row.original.aso_number ?? row.original.id}</div>;
    },
  },
  {
    accessorKey: 'patient_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nome
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="px-3">{row.original.patient?.name ?? '-'}</div>;
    },
  },
  {
    accessorKey: 'phone1',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Telefone
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="px-3">{row.original.patient?.phone1 ?? '-'}</div>;
    },
  },
  {
    accessorKey: 'patient_email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Email
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="px-3">{row.original.patient?.email ?? '-'}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Status
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status');
      return (
        <Badge
          className="text-xs"
          variant={status === 1 ? 'secondary' : status === 0 ? 'outline' : 'default'}>
          {status === 1 ? 'Aprovado' : status === 0 ? 'Pendente' : 'Reprovado'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'actions',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="center text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Ações
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: () => {
      return (
        <div className="flex items-center justify-center gap-4">
          <Manage />
        </div>
      );
    },
  },
];
