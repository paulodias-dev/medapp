import { InputFormItem } from '@/views/components/ui/input-form-item';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/views/components/ui/button';
import { Form } from '@/views/components/ui/form';
import { 
  Eye, 
  EyeSlash, 
  SpinnerGap, 
  ShieldCheck, 
  LockKey, 
  Key, 
  CheckCircle,
  ShieldWarning,
  ArrowRight,
  Info
} from '@phosphor-icons/react';
import { useState } from 'react';
import { clientService } from '@/app/services/client';
import { toast } from 'sonner';

const schema = z
  .object({
    oldPassword: z.string().min(1, 'A senha atual é obrigatória'),
    password: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-zA-Z0-9]/, 'A senha deve conter letras e números'),
    confirmPassword: z
      .string()
      .min(1, 'A confirmação de senha é obrigatória'),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'As senhas não conferem.',
        path: ['confirmPassword'],
      });
    }
  });

export function Security() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    defaultValues: {
      oldPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const submit = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      return clientService.changePassword({
        current_password: values.oldPassword,
        new_password: values.password,
        new_password_confirmation: values.confirmPassword,
      });
    },
    onSuccess: () => {
      toast.success('Senha atualizada com sucesso!', {
        icon: <ShieldCheck size={20} weight="fill" className="text-emerald-500" />,
      });
      form.reset();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Erro ao atualizar senha.';
      toast.error(message);
    },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    submit.mutate(values);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 w-full">
      <header className="relative overflow-hidden rounded-[2rem] border bg-white p-8 shadow-sm">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest">
              <ShieldCheck size={20} weight="bold" />
              Segurança da Conta
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Atualizar senha</h1>
            <p className="text-slate-500 max-w-lg font-medium">
              Proteja sua conta alterando sua senha regularmente. Use uma combinação forte de caracteres.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="h-20 w-20 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
               <LockKey size={40} weight="duotone" />
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <section className="rounded-[2.5rem] border bg-white p-8 shadow-sm">
          <Form {...form}>
            <form
              className="w-full flex flex-col gap-8"
              onSubmit={form.handleSubmit(onSubmit)}>
              
              <div className="space-y-6">
                <InputFormItem
                  control={form.control}
                  name="oldPassword"
                  label="Senha atual"
                  placeholder="Sua senha secreta atual"
                  type={showOldPassword ? 'text' : 'password'}
                  actions={
                    <button
                      type="button"
                      className="absolute right-4 top-2.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      onClick={() => setShowOldPassword((prev) => !prev)}>
                      {showOldPassword ? (
                        <EyeSlash className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  required
                />

                <div className="h-px bg-slate-100 w-full" />

                <InputFormItem
                  control={form.control}
                  name="password"
                  label="Nova senha"
                  placeholder="Mínimo 8 caracteres"
                  type={showNewPassword ? 'text' : 'password'}
                  actions={
                    <button
                      type="button"
                      className="absolute right-4 top-2.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      onClick={() => setShowNewPassword((prev) => !prev)}>
                      {showNewPassword ? (
                        <EyeSlash className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  required
                />

                <InputFormItem
                  control={form.control}
                  name="confirmPassword"
                  label="Confirmar nova senha"
                  placeholder="Repita a nova senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  actions={
                    <button
                      type="button"
                      className="absolute right-4 top-2.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}>
                      {showConfirmPassword ? (
                        <EyeSlash className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  required
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-[2rem] p-6 border border-slate-100 shadow-inner">
                <div className="flex items-center gap-3 ml-2 text-slate-500">
                    <Info size={20} weight="fill" />
                    <span className="text-xs font-bold uppercase tracking-wider">A senha será alterada instantaneamente</span>
                </div>
                <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all gap-2"
                    disabled={submit.isPending}
                >
                  {submit.isPending ? (
                    <SpinnerGap className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Salvar Nova Senha
                      <ArrowRight size={18} weight="bold" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </section>

        <aside className="space-y-6">
           <div className="rounded-[2rem] border bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white shadow-xl shadow-indigo-200">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                 <Key size={24} weight="fill" />
              </div>
              <h5 className="font-bold text-lg mb-2">Requisitos de Senha</h5>
              <ul className="space-y-3">
                 <li className="flex items-start gap-2 text-sm text-indigo-50 font-medium">
                    <CheckCircle size={16} weight="fill" className="mt-0.5 text-indigo-300" />
                    Mínimo de 8 caracteres
                 </li>
                 <li className="flex items-start gap-2 text-sm text-indigo-50 font-medium">
                    <CheckCircle size={16} weight="fill" className="mt-0.5 text-indigo-300" />
                    Pelo menos uma letra maiúscula
                 </li>
                 <li className="flex items-start gap-2 text-sm text-indigo-50 font-medium">
                    <CheckCircle size={16} weight="fill" className="mt-0.5 text-indigo-300" />
                    Letras e números
                 </li>
              </ul>
           </div>

           <div className="rounded-[2rem] border bg-white p-6 shadow-sm border-amber-100">
              <div className="flex items-center gap-3 text-amber-600 mb-2">
                 <ShieldWarning size={20} weight="fill" />
                 <h5 className="font-bold text-sm uppercase">Importante</h5>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                 Nunca compartilhe sua senha com ninguém. A nossa equipe nunca solicitará sua senha por e-mail ou telefone.
              </p>
           </div>
        </aside>
      </div>
    </div>
  );
}
