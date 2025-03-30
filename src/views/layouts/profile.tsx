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

      <div className="container flex flex-col justify-between">
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

        <div className="animate-slidein600 opacity-0 flex flex-1 flex-col space-y-8 overflow-auto lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="sticky top-0 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="w-full p-1 pr-4 lg:max-w-xl">
            <div className="pb-16">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
