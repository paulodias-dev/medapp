import { ForgotPasswordProps } from '@/app/models';
import { clientService } from '@/app/services/client';
import { cpfCnpjMask } from '@/app/utils';
import { digitsOnly, isValidCpfOrCnpj } from '@/app/utils/document-validator';
import { Button } from '@/views/components/ui/button';
import { Form } from '@/views/components/ui/form';
import { InputFormItem } from '@/views/components/ui/input-form-item';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpRight, SpinnerGap } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';

const schema = z.object({
  cpf_cnpj: z
    .string({
      required_error: 'Esse campo não pode ser nulo.',
    })
    .min(1, { message: 'Insira valores nesse campo.' })
    .refine((value: string) => isValidCpfOrCnpj(value), 'Digite um CPF ou CNPJ válido.'),
});

export function ForgotPassword() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      cpf_cnpj: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (props: ForgotPasswordProps) => {
      const data = await clientService.forgotPassword(props);
      toast.success(data.message || 'Solicitação enviada com sucesso.');
    },
    onError: (error: unknown) => {
      const errorMessage = resolveApiErrorMessage(error);
      const lowerMessage = errorMessage.toLowerCase();

      toast.error(
        lowerMessage.includes('desativada') ? 'Conta desativada' : 'Não foi possível recuperar a senha.',
        {
        description: errorMessage,
        },
      );
    },
  });

  function onSubmit(data: ForgotPasswordProps) {
    mutate({
      ...data,
      cpf_cnpj: digitsOnly(data.cpf_cnpj),
    });
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      <div className="relative flex w-full flex-col items-center justify-center gap-8 px-4 sm:px-6 py-8 lg:w-2/5">
        <div className="w-full max-w-[420px]">
          <div className="flex flex-col items-center gap-20">
            <img
              src="/grupo-ssma.png"
              className="animate-slidein200 opacity-0 w-44"
            />

            <Form {...form}>
              <form
                className="animate-slidein400 opacity-0 w-full min-h-[260px] flex flex-col gap-4 my-4 border-slate-400"
                onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">
                  <InputFormItem
                    control={form.control}
                    name="cpf_cnpj"
                    label="CPF/CNPJ"
                    type="text"
                    className="w-full h-fit px-4 py-2 text-base"
                    onChange={(e) => {
                      form.setValue('cpf_cnpj', cpfCnpjMask(e.target.value));
                    }}
                    tabIndex={1}
                    placeholder="Insira seu CPF ou CNPJ"
                    description="Insira o CPF ou CNPJ cadastrado."
                    required
                  />

                  <p className="text-sm text-slate-500">
                    As instruções de redefinição serão enviadas para o e-mail cadastrado.
                  </p>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full rounded-xl flex items-center justify-between gap-1 sm:!h-11"
                    disabled={isPending}>
                    Enviar E-mail
                    {isPending ? (
                      <SpinnerGap className="w-5 h-5 animate-spin" />
                    ) : (
                      <ArrowUpRight />
                    )}
                  </Button>

                  <Button asChild type="button" variant="ghost" className="w-full rounded-xl">
                    <Link to="/auth">Voltar ao login</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        <div className="animate-slidein600 opacity-0 flex items-center justify-center">
          <p className="p-0 sm:p-4 text-xs text-center text-black/50 text-balance">
            Ao continuar, você concorda com os{' '}
            <a className="underline" href="/policies/terms">
              Termos de Serviço
            </a>{' '}
            e a{' '}
            <a className="underline" href="/policies/privacy">
              Política de Privacidade
            </a>
            , e receber emails periódicos com atualizações.
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

  return 'Não foi possível concluir a solicitação.';
}
