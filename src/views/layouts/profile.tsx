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
      {/* Page header */}
      <div className="border-b border-slate-100 bg-white px-4 sm:px-6">
        <div className="mx-auto max-w-7xl py-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Perfil do usuário
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Veja e edite suas informações de perfil.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-1 flex-col gap-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-24 h-fit">
            <SidebarNav items={sidebarNavItems} />
          </aside>

          <div className="min-w-0 w-full pb-16">
            <div className="w-full rounded-2xl border border-slate-100 bg-white shadow-sm p-4 sm:p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

