import { ClientPatientListItem } from '@/app/models';
import { phoneMask } from '@/app/utils';
import { Badge } from '@/views/components/ui/badge';
import { Button } from '@/views/components/ui/button';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

const sortableHeaderClass =
  'h-8 px-2 -ml-2 justify-start font-semibold text-slate-600 hover:bg-slate-100';

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
    cell: () => (
      <div className="flex items-center justify-center">
        <Button asChild size="sm" variant="outline" className="rounded-xl">
          <Link to="/certificate/date">Solicitar exame</Link>
        </Button>
      </div>
    ),
  },
];
