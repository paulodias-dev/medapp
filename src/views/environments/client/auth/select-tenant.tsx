import { useAuth } from '@/app/context/use-auth';
import { getCompanyImageUrl } from '@/app/utils/get-company-image-url';
import { Button } from '@/views/components/ui/button';
import { ArrowRight, CaretRight, SignOut } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export function SelectTenant() {
  const { tenants, switchTenant, signOut, user } = useAuth();
  const navigate = useNavigate();

  async function handleSelect(id: number) {
    await switchTenant(id);
    navigate('/');
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <div className="container relative flex flex-col items-center justify-center gap-8 lg:w-full max-w-2xl mx-auto py-12">
        <div className="w-full flex flex-col items-center gap-8">
          <img src="/grupo-ssma.png" className="w-32 mb-4" alt="Logo" />

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Olá, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-slate-500">
              Identificamos que você possui acesso a múltiplas empresas.
              <br />
              Por favor, selecione qual deseja acessar agora:
            </p>
          </div>

          <div className="w-full grid gap-3 mt-4">
            {tenants.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all text-left"
              >
                <div className="relative shrink-0">
                  <img
                    src={getCompanyImageUrl(item.id, item.img)}
                    alt={item.name_fantasy}
                    className="h-12 w-12 rounded-xl object-contain border border-slate-100 bg-white"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                    {item.name_fantasy}
                  </span>
                  <span className="text-xs text-slate-500">
                    Unidade #{item.branch_id} • CNPJ: {item.name}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <CaretRight size={18} weight="bold" />
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-200 w-full justify-center">
            <Button
              variant="ghost"
              onClick={signOut}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 gap-2 rounded-xl"
            >
              <SignOut size={20} />
              Sair da conta
            </Button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-12">
          SSMA Gestão de Saúde e Segurança
        </p>
      </div>
    </div>
  );
}
