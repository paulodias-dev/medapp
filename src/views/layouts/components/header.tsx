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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/views/components/ui/sheet';
import { cn } from '@/app/utils';
import { 
  ArrowRight, 
  House, 
  Lightning, 
  ListChecks, 
  User as UserIcon, 
  ShieldCheck, 
  WhatsappLogo,
  List,
  SignOut,
  CaretRight
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

  const NavItem = ({ to, children, icon: Icon, onClick }: { to: string; children: React.ReactNode; icon?: any; onClick?: () => void }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold",
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

  const navigationItems = [
    { to: "/", label: "Início", icon: House },
    { to: "/certificates", label: "Atestados", icon: ListChecks },
    { to: "/newsroom", label: "Novidades", icon: Lightning },
  ];

  return (
    <div className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl text-slate-600">
                <List size={24} weight="bold" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r-0">
              <SheetHeader className="p-6 border-b border-slate-50">
                <SheetTitle className="text-left flex items-center gap-3">
                  <img src="/grupo-ssma.png" className="h-8 w-auto" alt="Logo" />
                  <span className="text-lg font-black text-slate-900 tracking-tight">MedApp</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-1 p-4">
                <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navegação</p>
                {navigationItems.map((item) => (
                  <NavItem key={item.to} to={item.to} icon={item.icon}>
                    {item.label}
                  </NavItem>
                ))}
                
                <div className="my-4 border-t border-slate-50" />
                
                <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ações</p>
                <Link 
                  to="/certificate" 
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <ListChecks size={20} weight="fill" />
                    Solicitar atestado
                  </div>
                  <CaretRight size={16} weight="bold" />
                </Link>
              </div>

              <div className="absolute bottom-0 w-full p-4 border-t border-slate-50 bg-slate-50/50">
                 <div className="flex items-center gap-3 px-2 py-2">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 truncate max-w-[180px]">{profile?.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Empresa #{profile?.id}</span>
                    </div>
                 </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
            <img src="/grupo-ssma.png" className="h-10 w-auto" alt="Logo Grupo SSMA" />
            <span className="hidden sm:inline-block text-xl font-black text-slate-900 tracking-tighter">MedApp</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => (
              <NavItem key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </NavItem>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <Button
            asChild
            variant="ghost"
            className="hidden md:flex rounded-2xl gap-2 bg-slate-50 hover:bg-slate-100 text-slate-900 px-6 h-12 font-bold transition-all active:scale-95 border border-slate-100/50">
            <Link to="/certificate">
              Solicitar atestado
              <ArrowRight className="w-4 h-4" weight="bold" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 sm:gap-4 group focus:outline-none rounded-xl transition-all active:scale-[0.98]">
                <div className="flex flex-col items-end text-right hidden sm:flex">
                  <span className="text-sm font-bold text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                    {profile?.name || 'Carregando...'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                    Empresa #{profile?.id || '----'}
                  </span>
                </div>

                <div className="relative">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm sm:text-lg shadow-lg shadow-blue-200 overflow-hidden ring-2 sm:ring-4 ring-white transition-transform group-hover:scale-105">
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
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-72 mt-3 p-2 rounded-3xl shadow-2xl shadow-blue-900/10 border-slate-100 z-[999999] animate-in slide-in-from-top-2 duration-200"
              align="end"
              forceMount>
              <DropdownMenuLabel className="px-3 py-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Conta Verificada</p>
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100">
                      <UserIcon size={20} weight="fill" />
                   </div>
                   <div className="flex flex-col overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate">{profile?.name || 'Usuário'}</p>
                      <p className="text-xs text-slate-500 truncate font-medium">{profile?.email}</p>
                   </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="my-2 bg-slate-100" />

              <div className="grid gap-1">
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 focus:bg-slate-50 px-3 transition-colors">
                  <Link to="/profile" className="flex items-center gap-3 w-full">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <UserIcon size={18} weight="duotone" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-700">Meu Perfil</span>
                      <span className="text-[10px] text-slate-400 font-bold">Dados e preferências</span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 focus:bg-slate-50 px-3 transition-colors">
                  <Link to="/profile/security" className="flex items-center gap-3 w-full">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <ShieldCheck size={18} weight="duotone" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-700">Segurança</span>
                      <span className="text-[10px] text-slate-400 font-bold">Senha e acesso</span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 focus:bg-slate-50 px-3 transition-colors">
                  <Link
                    to="https://wa.me/5579981291760?text=Ol%C3%A1%2C+Preciso+de+ajuda+com%3A+"
                    target="_blank"
                    className="flex items-center gap-3 w-full">
                    <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                      <WhatsappLogo size={18} weight="fill" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-green-700">Suporte Técnico</span>
                      <span className="text-[10px] text-green-500 font-bold">Fale conosco pelo WhatsApp</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-2 bg-slate-100" />

              <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 py-3 px-3 transition-colors">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                    <SignOut size={18} weight="bold" />
                  </div>
                  <Out />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
