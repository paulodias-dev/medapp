import { Lock, User } from '@phosphor-icons/react';
import { Outlet } from 'react-router-dom';

import { SidebarNav } from './components/sidebar-nav';

const sidebarNavItems = [
  {
    title: 'Meu Perfil',
    icon: <User size={18} weight="duotone" />,
    href: '/profile/user-data',
  },
  {
    title: 'Segurança',
    icon: <Lock size={18} weight="duotone" />,
    href: '/profile/security',
  },
];

export function Profile() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Perfil do usuário
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Veja e edite suas informações de perfil.
            </p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
            Conta e segurança
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-1 flex-col gap-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-24 h-fit">
            <SidebarNav items={sidebarNavItems} />
          </aside>

          <div className="min-w-0 w-full pb-16">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
