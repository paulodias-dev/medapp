import { WarningExamResponse } from '@/app/services/dashboard/warning-exams';
import { phoneMask } from '@/app/utils';
import { Badge } from '@/views/components/ui/badge';
import { Button } from '@/views/components/ui/button';
import { Check, Copy } from '@phosphor-icons/react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { toast } from 'sonner';

function getStatusMeta(status: number) {
  if (status === 1) {
    return { label: 'Aprovado', variant: 'secondary' as const };
  }

  if (status === 0) {
    return { label: 'Pendente', variant: 'outline' as const };
  }

  return { label: 'Reprovado', variant: 'default' as const };
}

export const columns: ColumnDef<WarningExamResponse>[] = [
  {
    accessorFn: (row) => row.aso_number ?? row.id,
    id: 'aso',
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
      const [copiedId, setCopiedId] = useState<string | null>(null);
      const asoValue = String(row.getValue('aso'));

      async function handleCopyToClipBoard(id: string) {
        try {
          await navigator.clipboard.writeText(id);
          toast.success(`ASO ${id} copiado!`);
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error('Falha ao copiar o ID. Tente novamente.');
        }
      }

      return (
        <div className="group flex items-center gap-2 font-medium">
          {asoValue}
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => handleCopyToClipBoard(asoValue)}>
            {copiedId === asoValue ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="sr-only">
              {copiedId === asoValue ? 'Copiado!' : 'Copiar ASO'}
            </span>
          </Button>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.patient?.name ?? '-',
    id: 'nome',
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
    accessorFn: (row) => row.patient?.phone1 ?? '-',
    id: 'telefone',
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
      const phone = row.original.patient?.phone1 ?? '';
      return <div className="px-3">{phone ? phoneMask(phone) : '-'}</div>;
    },
  },
  {
    accessorFn: (row) => row.patient?.email ?? '-',
    id: 'email',
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
    accessorFn: (row) => row.expires_at ?? '-',
    id: 'expires_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Vencimento
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="px-3">{formatDatePtBr(row.original.expires_at)}</div>;
    },
  },
  {
    accessorFn: (row) => row.days_overdue ?? 0,
    id: 'days_overdue',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Dias em atraso
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const days = row.original.days_overdue ?? 0;
      return <div className="px-3 font-medium">{days}</div>;
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
      const status = Number(row.getValue('status'));
      const statusMeta = getStatusMeta(status);
      return (
        <Badge className="text-xs" variant={statusMeta.variant}>
          {statusMeta.label}
        </Badge>
      );
    },
  },
];

function formatDatePtBr(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(parsed);
}
