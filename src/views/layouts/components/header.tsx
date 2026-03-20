import { clientService } from '@/app/services/client';
import { resolveClientAvatarUrl } from '@/app/utils';
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
import { cn } from '@/app/utils';
import { 
  ArrowRight, 
  House, 
  Lightning, 
  ListChecks, 
  User as UserIcon, 
  ShieldCheck, 
  WhatsappLogo 
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Out } from './out';

export function Header() {
  const location = useLocation();
  const { data: profile } = useQuery({
    queryKey: ['profileHeaderAvatar'],
    queryFn: clientService.verifyToken,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const avatarUrl = resolveClientAvatarUrl(profile?.img, profile?.id, profile?.updated_at);
  const initials = getInitials(profile?.name);

  const NavItem = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon?: any }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-bold",
          isActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )
      }
    >
      {Icon && <Icon size={18} weight={location.pathname === to ? "fill" : "regular"} />}
      {children}
    </NavLink>
  );

  return (
    <div className="sticky top-0 z-[100] w-full bg-white border-b border-slate-100">
      <header className="relative max-w-full mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-10">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src="/grupo-ssma.png" className="h-10 w-auto" alt="Logo Grupo SSMA" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <NavItem to="/" icon={House}>Início</NavItem>
            <NavItem to="/certificates" icon={ListChecks}>Atestados</NavItem>
            <NavItem to="/newsroom" icon={Lightning}>Novidades</NavItem>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <Button
            asChild
            variant="ghost"
            className="hidden sm:flex rounded-2xl gap-2 bg-slate-50 hover:bg-slate-100 text-slate-900 px-6 h-12 font-bold transition-all active:scale-95 border border-slate-100/50">
            <Link to="/certificate">
              Solicitar atestado
              <ArrowRight className="w-4 h-4" weight="bold" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-4 group focus:outline-none rounded-xl transition-all active:scale-[0.98]">
                <div className="flex flex-col items-end text-right hidden md:flex">
                  <span className="text-sm font-bold text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                    {profile?.name || 'Carregando...'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                    Empresa #{profile?.id || '----'}
                  </span>
                </div>

                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-200 overflow-hidden ring-4 ring-white transition-transform group-hover:scale-105">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="User Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="tracking-tighter">{initials}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-64 mt-3 p-2 rounded-3xl shadow-2xl shadow-blue-900/10 border-slate-100 z-[999999] animate-in slide-in-from-top-2 duration-200"
              align="end"
              forceMount>
              <DropdownMenuLabel className="px-3 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Minha Conta</p>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-slate-900 truncate">{profile?.name || 'Usuário'}</p>
                  <p className="text-xs text-slate-500 truncate font-medium">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2 bg-slate-100" />

              <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 focus:bg-slate-50">
                <Link to="/profile" className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <UserIcon size={18} weight="duotone" />
                  </div>
                  <span className="font-bold text-slate-700">Configurações</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 focus:bg-slate-50">
                <Link
                  to="https://wa.me/5579981291760?text=Ol%C3%A1%2C+Preciso+de+ajuda+com%3A+"
                  target="_blank"
                  className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                    <WhatsappLogo size={18} weight="fill" />
                  </div>
                  <span className="font-bold text-green-700">Suporte Técnico</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2 bg-slate-100" />

              <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 py-2.5">
                <Out />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="bg-slate-50/30 border-t border-slate-100 overflow-x-auto no-scrollbar">
        <Menubar className="max-w-7xl mx-auto border-none bg-transparent h-10 shadow-none px-4 gap-2">
          <MenubarMenu>
            <MenubarTrigger className="data-[state=open]:bg-white rounded-lg text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <ListChecks size={14} />
                Atestados
              </div>
            </MenubarTrigger>
            <MenubarContent className="rounded-xl p-1 shadow-lg border-slate-100">
              <MenubarItem asChild className="rounded-lg cursor-pointer">
                <NavLink to="/certificates">Gerenciar Atestados</NavLink>
              </MenubarItem>
              <MenubarItem asChild className="rounded-lg cursor-pointer">
                <NavLink to="/certificate">Solicitar Novo Atestado</NavLink>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="data-[state=open]:bg-white rounded-lg text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Segurança
              </div>
            </MenubarTrigger>
            <MenubarContent className="rounded-xl p-1 shadow-lg border-slate-100">
              <MenubarItem asChild className="rounded-lg cursor-pointer">
                <NavLink to="/profile/user-data">Meus Dados</NavLink>
              </MenubarItem>
              <MenubarItem asChild className="rounded-lg cursor-pointer">
                <NavLink to="/profile/security">Segurança da Conta</NavLink>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="data-[state=open]:bg-white rounded-lg text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <WhatsappLogo size={14} />
                Ajuda
              </div>
            </MenubarTrigger>
            <MenubarContent className="rounded-xl p-1 shadow-lg border-slate-100">
              <MenubarItem asChild className="rounded-lg cursor-pointer">
                <Link
                  to="https://wa.me/5579981291760?text=Ol%C3%A1%2C+Preciso+de+ajuda+com%3A+"
                  target="_blank">
                  Falar com Consultor
                </Link>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
}
