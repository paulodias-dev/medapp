import { useAuth } from '@/app/context/use-auth';
import { getCompanyImageUrl } from '@/app/utils/get-company-image-url';
import { Button } from '@/views/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/views/components/ui/dropdown-menu';
import { CaretUpDown, Check, PlusCircle } from '@phosphor-icons/react';
import { useState } from 'react';

export function TenantSelector() {
  const { tenant, tenants, switchTenant } = useAuth();
  const [open, setOpen] = useState(false);

  if (tenants.length <= 1) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar empresa"
          className="flex items-center gap-2 px-2 h-9 border border-white/20 bg-white/10 hover:bg-white/20 transition-all rounded-lg text-slate-900"
        >
          <CaretUpDown size={14} className="text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px] z-[999999999] p-1 border-white/20 shadow-xl backdrop-blur-xl bg-white/90">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 py-1.5">
          Minhas Empresas
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100" />
        <div className="max-h-[300px] overflow-y-auto py-1">
          {tenants.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => switchTenant(item.id)}
              className="flex items-center gap-3 px-2 py-2 cursor-pointer focus:bg-primary/5 rounded-md transition-colors"
            >
              <div className="relative shrink-0">
                <img
                  src={getCompanyImageUrl(item.id, item.img)}
                  alt={item.name_fantasy}
                  className="h-8 w-8 rounded object-contain border border-slate-100"
                />
                {tenant?.id === item.id && (
                  <div className="absolute -right-1 -top-1 bg-green-500 rounded-full p-0.5 border-2 border-white shadow-sm">
                    <Check size={8} weight="bold" className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className={`text-xs font-semibold truncate ${tenant?.id === item.id ? 'text-primary' : 'text-slate-900'}`}>
                  {item.name_fantasy}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  Unidade #{item.branch_id}
                </span>
              </div>
              {tenant?.id === item.id && (
                <Check size={16} className="text-primary ml-auto" weight="bold" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="bg-slate-100" />
        <DropdownMenuItem className="flex items-center gap-3 px-2 py-2 mt-1 cursor-not-allowed opacity-50 grayscale">
          <PlusCircle size={18} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Adicionar Empresa</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
