import { clientService } from '@/app/services/client';
import { Button } from '@/views/components/ui/button';
import { Form } from '@/views/components/ui/form';
import { InputFormItem } from '@/views/components/ui/input-form-item';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpRight, Eye, EyeSlash, SpinnerGap } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';

// Validação de senha e confirmação
const schema = z
  .object({
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres.')
      .nonempty('Este campo não pode estar vazio.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas devem coincidir.',
    path: ['confirmPassword'], // Aplica a mensagem de erro no campo "confirmPassword"
  });

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passwordType, setPasswordType] = useState(true);
  const token = searchParams.get('token');

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  type FormData = z.infer<typeof schema>;

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      if (!token) {
        throw new Error('Token de redefinição não informado.');
      }

      return clientService.resetPassword({
        token,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });
    },
    onSuccess: (message) => {
      toast.success(message || 'Senha redefinida com sucesso.');
      navigate('/auth');
    },
    onError: (error: unknown) => {
      toast.error('Não foi possível redefinir a senha.', {
        description: resolveApiErrorMessage(error),
      });
    },
  });

  function onSubmit(data: FormData) {
    mutate(data);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      <div className="relative flex w-full flex-col items-center justify-center gap-8 px-4 sm:px-6 py-8 lg:w-2/5">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-20">
            <img
              src="/grupo-ssma.png"
              className="animate-slidein200 opacity-0 w-44"
            />

            <Form {...form}>
              <form
                className="animate-slidein400 opacity-0 w-full flex flex-col gap-4 my-4 border-slate-400"
                onSubmit={form.handleSubmit(onSubmit)}>
                <InputFormItem
                  control={form.control}
                  name="password"
                  label="Nova Senha"
                  placeholder="********"
                  description="Digite a nova senha para acessar o sistema."
                  type={passwordType ? 'password' : 'text'}
                  actions={
                    <button
                      type="button"
                      className="absolute right-4 top-2.5"
                      onClick={() => setPasswordType((prev) => !prev)}>
                      {passwordType ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeSlash className="w-5 h-5" />
                      )}
                    </button>
                  }
                  required
                />

                <InputFormItem
                  control={form.control}
                  name="confirmPassword"
                  label="Repetir Nova Senha"
                  placeholder="********"
                  description="Confirme sua nova senha."
                  type={passwordType ? 'password' : 'text'}
                  required
                />

                <Button
                  type="submit"
                  className="w-full rounded-xl flex items-center justify-between gap-1 sm:!h-11"
                  disabled={isPending || !token}>
                  Atualizar Senha
                  {isPending ? (
                    <SpinnerGap className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUpRight />
                  )}
                </Button>

                <Button asChild type="button" variant="ghost" className="w-full rounded-xl">
                  <Link to="/auth">Voltar ao login</Link>
                </Button>
              </form>
            </Form>

            {!token && (
              <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                Link inválido. Solicite uma nova redefinição de senha.
              </div>
            )}
          </div>
        </div>

        <div className="animate-slidein600 opacity-0 flex items-center justify-center">
          <p className="p-0 sm:p-4 text-xs text-center text-black/50 text-balance">
            Ao redefinir sua senha, você concorda com os{' '}
            <a className="underline" href="/policies/terms">
              Termos de Serviço
            </a>{' '}
            e a{' '}
            <a className="underline" href="/policies/privacy">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>

      <div
        className="shrink-0 w-[1px] hidden -mt-16"
        data-orientation="vertical"
        role="none"
      />

      <div className="animate-slidein600 opacity-0 items-center justify-center flex-col hidden w-3/5 lg:flex px-6">
        <div className="h-4 w-[60%]  bg-[#ECDACB] rounded-t-xl blur-md" />
        <div className="h-8 w-[80%] backdrop-blur-sm bg-[#ECDACB] rounded-t-xl blur-sm" />
        <img src="/bg-image-auth.png" alt="" className="w-full max-w-3xl" />
      </div>
    </div>
  );
}

function resolveApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as
      | { error?: string; message?: string; details?: Record<string, string[]> | string }
      | undefined;

    if (responseData?.error) {
      return responseData.error;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (typeof responseData?.details === 'string') {
      return responseData.details;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a redefinição de senha.';
}
