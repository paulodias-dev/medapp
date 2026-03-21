import { cn } from '@/app/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/views/components/ui/select';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [val, setVal] = useState(pathname ?? '/settings');

  const handleSelect = (e: string) => {
    setVal(e);
    navigate(e);
  };

  return (
    <>
      <div className="p-1 md:hidden">
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger className="h-12 rounded-xl border-slate-200">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {items.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex items-center gap-3 px-1 py-0.5">
                  <span>{item.icon}</span>
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-sm md:block">
        <nav
          className={cn(
            'flex flex-col gap-1',
            className,
          )}
          {...props}>
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]',
                )
              }>
              <span>{item.icon}</span>
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
