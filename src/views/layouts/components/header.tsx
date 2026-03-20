import { Button } from '@/views/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/views/components/ui/dropdown-menu';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/views/components/ui/menubar';
import { ArrowRight, Lightning } from '@phosphor-icons/react';
import { Link, NavLink } from 'react-router-dom';
import { Out } from './out';
import { TenantSelector } from './tenant-selector';
import { useAuth } from '@/app/context/use-auth';
import { getCompanyImageUrl } from '@/app/utils/get-company-image-url';

export function Header() {
  const { tenant, user } = useAuth();
  const logoUrl = getCompanyImageUrl(tenant?.id ?? 0, tenant?.img ?? null);

  return (
    <div className="sticky top-0 backdrop-blur-md bg-white/30 z-[99999999] border-b border-white/20">
      <header className="p-4 flex items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group transition-all">
              <div className="relative">
                <img src={logoUrl} className="h-10 w-10 object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-primary/5 rounded-lg -z-10 group-hover:bg-primary/10 transition-colors" />
              </div>
              <div className="flex flex-col mr-2">
                <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight">
                  {tenant?.name_fantasy || 'Portal do Cliente'}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                  SSMA Gestão
                </span>
              </div>
            </Link>
            <TenantSelector />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-fit h-fit flex items-center gap-2">
              <Button
                asChild
                variant="secondary"
                className="rounded-xl flex items-center justify-center gap-2">
                <NavLink to="/">
                  <p className="leading-3">Início</p>
                </NavLink>
              </Button>

              <Button asChild variant="ghost" className="rounded-xl">
                <NavLink to="/newsroom">
                  <Lightning size={20} />
                </NavLink>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="secondary"
            className="rounded-xl flex items-center gap-1">
            <Link to="/certificate">
              Solicitar atestado
              <ArrowRight className="w-4" />
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative !p-0 hover:bg-transparent">
                  <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-end hidden sm:flex">
                      <span className="text-xs font-semibold text-slate-900">{user?.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Empresa #{tenant?.id}</span>
                    </div>
                    <img
                      src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&bold=true`}
                      alt={user?.name || ''}
                      className="h-10 w-10 rounded-xl border-2 border-white shadow-sm"
                    />
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-48 z-[999999999]"
                align="end"
                forceMount>
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="https://wa.me/5579981291760?text=Ol%C3%A1%2C+Preciso+de+ajuda+com%3A+"
                    target="_blank">
                    Suporte Técnico
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Out />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Menubar className="px-2">
        <MenubarMenu>
          <MenubarTrigger>Atestados</MenubarTrigger>
          <MenubarContent>
            <MenubarItem asChild>
              <NavLink
                className="active:scale-95 aria-[current=page]:bg-primary aria-[current=page]:text-white cursor-pointer transition-all"
                to="/certificates">
                Gerênciar
              </NavLink>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
