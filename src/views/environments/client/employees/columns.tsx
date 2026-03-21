import { ClientPatientListItem } from '@/app/models';
import { phoneMask } from '@/app/utils';
import { Badge } from '@/views/components/ui/badge';
import { Button } from '@/views/components/ui/button';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

const sortableHeaderClass =
  'h-8 px-2 -ml-2 justify-start font-semibold text-slate-600 hover:bg-slate-100';

function digitsOnly(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

function getCertificateRequestUrl(cpf: string | null): string {
  const normalizedCpf = digitsOnly(cpf);
  if (normalizedCpf.length !== 11) {
    return '/certificate';
  }

  const params = new URLSearchParams();
  params.set('cpf', normalizedCpf);

  return `/certificate?${params.toString()}`;
}

function getCertificatesListUrl(patientId: number): string {
  const params = new URLSearchParams();
  params.set('patientId', String(patientId));

  return `/certificates?${params.toString()}`;
}

export const columns: ColumnDef<ClientPatientListItem>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className={sortableHeaderClass}
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Nome
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.name ?? '-'}</div>,
  },
  {
    accessorKey: 'cpf',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className={sortableHeaderClass}
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        CPF
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.cpf ?? '-'}</div>,
  },
  {
    accessorKey: 'phone1',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className={sortableHeaderClass}
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Telefone
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const phone = row.original.phone1 ?? '';
      return <div>{phone ? phoneMask(phone) : '-'}</div>;
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className={sortableHeaderClass}
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        E-mail
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.email ?? '-'}</div>,
  },
  {
    accessorKey: 'active',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className={sortableHeaderClass}
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Status
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const isActive = Boolean(row.original.active);
      return (
        <Badge variant={isActive ? 'secondary' : 'outline'} className="text-xs">
          {isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Button asChild size="sm" variant="outline" className="rounded-xl">
          <Link to={getCertificateRequestUrl(row.original.cpf)}>Solicitar exame</Link>
        </Button>

        <Button asChild size="sm" variant="ghost" className="rounded-xl">
          <Link to={getCertificatesListUrl(row.original.id)}>Ver atestados</Link>
        </Button>
      </div>
    ),
  },
];
