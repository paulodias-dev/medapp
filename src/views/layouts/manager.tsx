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
  House,
  Users,
  ClipboardText,
  Stethoscope,
  UserList,
  Buildings,
  FileText,
  Calendar,
  Gear,
  Search,
  CaretDown,
  List,
  Bell,
} from '@phosphor-icons/react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/context/use-auth';
import { Out } from './components/out';
import { cn } from '@/app/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/manager', icon: House },
  { name: 'Empresas', href: '/manager/clients', icon: Users },
  { name: 'Usuários', href: '/manager/users', icon: UserList },
  { name: 'Unidades', href: '/manager/branches', icon: Buildings },
  { name: 'Médicos', href: '/manager/doctors', icon: Stethoscope },
  { name: 'Pacientes', href: '/manager/patients', icon: UserList },
  { name: 'Exames', href: '/manager/exams', icon: ClipboardText },
  { name: 'Resultados', href: '/manager/results', icon: FileText },
  { name: 'Agendamentos', href: '/manager/schedules', icon: Calendar },
];

export function ManagerLayout() {
  const { user, tenant } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 border-r border-slate-200 bg-white shadow-xl shadow-slate-200/50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center gap-3 p-6 pt-8 overflow-hidden whitespace-nowrap">
          <div className="relative shrink-0">
            <img src="/grupo-ssma.png" className="h-10 w-10 object-contain rounded-lg shadow-sm" alt="Logo" />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-white flex items-center justify-center">
              <div className="h-1.5 w-1.5 bg-white rounded-full" />
            </div>
          </div>
          {isSidebarOpen && (
             <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 tracking-tight">SSMA Gestor</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-none mt-1">Admin Panel</span>
            </div>
          )}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group overflow-hidden whitespace-nowrap",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <item.icon size={isSidebarOpen ? 22 : 24} weight={isSidebarOpen ? "duotone" : "regular"} className="shrink-0" />
              {isSidebarOpen && (
                <span className="font-semibold text-sm transition-opacity duration-300">{item.name}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <NavLink
            to="/manager/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group overflow-hidden whitespace-nowrap",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <Gear size={isSidebarOpen ? 22 : 24} weight="duotone" className="shrink-0" />
            {isSidebarOpen && <span className="font-semibold text-sm">Configurações</span>}
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isSidebarOpen ? "pl-64" : "pl-20"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="h-9 w-9 text-slate-500 hover:bg-slate-50 rounded-lg"
              >
                <List size={22} weight="bold" />
              </Button>

              <div className="relative max-w-md w-full hidden md:block">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar módulos ou dados... (CMD+K)"
                  className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-600 placeholder:text-slate-400"
                />
              </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-600">
               <Bell size={22} weight="duotone" />
               <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide">Administrator</span>
                  </div>
                  <div className="relative">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&bold=true`}
                      alt={user?.name || ''}
                      className="h-9 w-9 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-100"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <CaretDown size={14} className="text-slate-400" weight="bold" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 mt-2 rounded-2xl border-slate-200 shadow-2xl p-2" align="end">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                    <span className="text-xs text-slate-500 font-medium truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link to="/manager/profile" className="flex items-center gap-2 px-3 py-2">
                    <UserList size={18} weight="duotone" className="text-slate-400" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                  <Out />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
           <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
             <Outlet />
           </div>

           {/* Decorator background blobs */}
           <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-slate-200/40 blur-[80px] rounded-full pointer-events-none" />
        </main>
      </div>
    </div>
  );
}
