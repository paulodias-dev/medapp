import { Lock, User } from '@phosphor-icons/react';
import { Outlet } from 'react-router-dom';

import { SidebarNav } from './components/sidebar-nav';

const sidebarNavItems = [
  {
    title: 'Perfil',
    icon: <User size={18} />,
    href: '/profile/user-data',
  },

  {
    title: 'Segurança',
    icon: <Lock size={18} />,
    href: '/profile/security',
  },
];

export function Profile() {
  return (
    <>
      <hr className="border-b-[10px] border-[#f5f5f5]" />

      <div className="mx-auto w-full max-w-[1480px] px-4 pb-8">
        <header className="animate-slidein200 opacity-0 mt-6 flex items-center justify-between mb-6">
          <div>
            <h1 className="mt-2 text-2xl font-medium tracking-tight text-slate-900 dark:text-slate-100">
              Perfil do usuário
            </h1>
            <p className="text-slate-600">
              Veja e edite suas informações de perfil.
            </p>
          </div>

          <div className="flex items-center gap-2" />
        </header>

        <div className="animate-slidein600 opacity-0 flex flex-1 flex-col gap-8 overflow-auto lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-24 h-fit">
            <SidebarNav items={sidebarNavItems} />
          </aside>

          <div className="min-w-0 w-full pb-16">
            <div className="w-full rounded-2xl border bg-white p-4 sm:p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
