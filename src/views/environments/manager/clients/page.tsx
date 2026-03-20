import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Search,
  Plus,
  DotsThreeVertical,
  Eye,
  PencilSimple,
  Trash,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/views/components/ui/card';
import { Button } from '@/views/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/views/components/ui/dropdown-menu';
import { managerService } from '@/app/services/manager';
import { Skeleton } from '@/views/components/ui/skeleton';

export function ClientsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['manager', 'clients', page, search],
    queryFn: () => managerService.getClients(page, search),
    placeholderData: (previousData) => previousData,
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearch(formData.get('search') as string);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Empresas</h1>
          <p className="text-slate-500 font-medium">Gerencie todas as empresas clientes do sistema.</p>
        </div>
        <Button className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20 h-11 px-6">
          <Plus size={20} weight="bold" />
          Nova Empresa
        </Button>
      </div>

      {/* Filters & Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-50 p-6">
          <form onSubmit={handleSearch} className="relative max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Pesquisar por nome, CNPJ ou email..."
              className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-600 placeholder:text-slate-400 font-medium"
            />
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Empresa</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">CPF/CNPJ</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Contato</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-48 rounded-lg" /></td>
                      <td className="px-6 py-4 hidden lg:table-cell"><Skeleton className="h-6 w-32 rounded-lg" /></td>
                      <td className="px-6 py-4 hidden md:table-cell"><Skeleton className="h-6 w-40 rounded-lg" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-lg" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                    </tr>
                  ))
                ) : data?.data.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 leading-tight">{client.name_fantasy || client.name}</span>
                          <span className="text-xs text-slate-500 font-medium">{client.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-600 font-medium">{client.cpf_cnpj}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600 font-medium">{client.phone1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        client.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {client.status === 1 ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600">
                             <DotsThreeVertical size={20} weight="bold" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-xl border-slate-200">
                          <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer">
                            <Eye size={18} weight="duotone" className="text-slate-400" />
                            <span className="font-medium">Visualizar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer">
                            <PencilSimple size={18} weight="duotone" className="text-slate-400" />
                            <span className="font-medium">Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                            <Trash size={18} weight="duotone" />
                            <span className="font-medium">Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && data && data.total === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Users size={48} weight="duotone" className="mb-4 opacity-20" />
              <p className="font-bold">Nenhuma empresa encontrada</p>
              <p className="text-sm">Tente ajustar seus termos de pesquisa.</p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && data && data.total > 0 && (
            <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">
                Mostrando <span className="font-bold text-slate-900">{data.data.length}</span> de <span className="font-bold text-slate-900">{data.total}</span> empresas
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-slate-200"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <CaretLeft size={16} weight="bold" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(data.last_page, 5) }).map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? 'default' : 'ghost'}
                      className={`h-8 w-8 p-0 rounded-lg text-xs font-bold ${page !== i + 1 ? 'text-slate-500' : ''}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-slate-200"
                  disabled={page === data.last_page}
                  onClick={() => setPage(p => p + 1)}
                >
                  <CaretRight size={16} weight="bold" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
