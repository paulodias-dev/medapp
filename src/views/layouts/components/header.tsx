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
import { ArrowRight, House, Lightning, ListChecks, User as UserIcon, ShieldCheck, WhatsappLogo } from '@phosphor-icons/react';
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

  const avatarSrc =
    resolveClientAvatarUrl(profile?.img, profile?.id, profile?.updated_at) ||
    DEFAULT_AVATAR_URL;

  const NavItem = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon?: any }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium",
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
    <div className="sticky top-0 z-[100] w-full">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md border-b" />
      
      <header className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src="/grupo-ssma.png" className="h-8 w-auto" alt="Logo Grupo SSMA" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/" icon={House}>Início</NavItem>
            <NavItem to="/certificates" icon={ListChecks}>Atestados</NavItem>
            <NavItem to="/newsroom" icon={Lightning}>Novidades</NavItem>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="default"
            className="hidden sm:flex rounded-full gap-2 bg-slate-900 hover:bg-slate-800 transition-all shadow-sm active:scale-95">
            <Link to="/certificate">
              Solicitar atestado
              <ArrowRight className="w-4 h-4" weight="bold" />
            </Link>
          </Button>

          <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl transition-transform active:scale-95">
                <div className="h-10 w-10 rounded-xl border-2 border-white shadow-sm overflow-hidden group-hover:border-blue-100 transition-colors">
                  <img
                    src={avatarSrc}
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_AVATAR_URL;
                    }}
                    alt="User Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-56 mt-2 p-2 rounded-2xl shadow-xl border-slate-100 z-[999999]"
              align="end"
              forceMount>
              <DropdownMenuLabel className="px-2 py-1.5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Minha Conta</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{profile?.name || 'Usuário'}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link to="/profile" className="flex items-center gap-2">
                  <UserIcon size={18} />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link
                  to="https://wa.me/5579981291760?text=Ol%C3%A1%2C+Preciso+de+ajuda+com%3A+"
                  target="_blank"
                  className="flex items-center gap-2 text-green-600 focus:text-green-700">
                  <WhatsappLogo size={18} weight="fill" />
                  <span>Suporte Técnico</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />
              
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                <Out />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="bg-slate-50/50 border-b overflow-x-auto no-scrollbar">
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

const DEFAULT_AVATAR_URL = 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff';
