import { ForgotPasswordProps } from '@/app/models';
import { clientService } from '@/app/services/client';
import { Button } from '@/views/components/ui/button';
import { Form } from '@/views/components/ui/form';
import { InputFormItem } from '@/views/components/ui/input-form-item';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpRight, SpinnerGap } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const schema = z.object({
  cpf_cnpj: z
    .string({
      required_error: 'Esse campo não pode ser nulo.',
    })
    .min(1, { message: 'Insira valores nesse campo.' })
    .refine((value: string) => {
      if (typeof value !== 'string') return false;

      value = value.replace(/[^\d]+/g, '');

      if (value.length === 11) {
        // CPF validation
        if (value.match(/(\d)\1{10}/)) return false;

        const cpfDigits = value.split('').map((el) => +el);

        function handleRest(count: number): number {
          return (
            ((cpfDigits
              .slice(0, count - 12)
              .reduce((sum, el, index) => sum + el * (count - index), 0) *
              10) %
              11) %
            10
          );
        }

        return (
          handleRest(10) === cpfDigits[9] && handleRest(11) === cpfDigits[10]
        );
      } else if (value.length === 14) {
        // CNPJ validation
        if (value.match(/(\d)\1{13}/)) return false;

        const cnpjDigits = value.split('').map((el) => +el);

        function handleRest(count: number): number {
          const length = count - 7;
          const numbers = cnpjDigits.slice(0, length);

          const sum = numbers.reduce(
            (acc, num, index) => acc + num * (length + 1 - index),
            0,
          );

          const rest = sum % 11;

          return rest < 2 ? 0 : 11 - rest;
        }

        return (
          handleRest(12) === cnpjDigits[12] && handleRest(13) === cnpjDigits[13]
        );
      }

      return false;
    }, 'Digite um CPF ou CNPJ válido.'),
  email: z
    .string({
      required_error: 'Esse campo não pode ser nulo.',
    })
    .email('Insira um e-mail válido.'),
});

export function ForgotPassword() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      cpf_cnpj: '',
      email: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (props: ForgotPasswordProps) => {
      const data = await clientService.forgotPassword(props);
      toast.success(data);
    },
    onError: (error) => {
      console.error('Authentication failed: response is null');
      toast.error('Falha ao autenticar. Tente novamente.', {
        description: error.message,
      });
    },
  });

  function onSubmit(data: ForgotPasswordProps) {
    mutate(data);
  }

  return (
    <div className="flex h-screen">
      <div className="container relative flex flex-col items-center justify-center gap-8 lg:w-2/5">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-20">
            <img
              src="/grupo-ssma.png"
              className="animate-slidein200 opacity-0 w-44"
            />

            <Form {...form}>
              <form
                className="animate-slidein400 opacity-0 flex flex-col gap-4 my-4 border-slate-400"
                onSubmit={form.handleSubmit(onSubmit)}>
                <InputFormItem
                  control={form.control}
                  name="cpf_cnpj"
                  label="CPF/CNPJ"
                  type="text"
                  className="h-fit px-4 py-2 text-base"
                  tabIndex={1}
                  placeholder="Digite o seu CPF ou CNPJ"
                  description="Insira o CPF ou CNPJ cadastrado."
                  required
                />

                <InputFormItem
                  control={form.control}
                  name="email"
                  label="E-mail"
                  type="email"
                  className="h-fit px-4 py-2 text-base"
                  tabIndex={2}
                  placeholder="Digite o seu e-mail"
                  description="Insira o e-mail cadastrado para receber o link de redefinição de senha."
                  required
                />

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

      <div className="animate-slidein600 opacity-0 items-center justify-center flex-col hidden w-3/5 lg:flex">
        <div className="h-4 w-[60%] bg-[#ECDACB] rounded-t-xl blur-md" />
        <div className="h-8 w-[80%] backdrop-blur-sm bg-[#ECDACB] rounded-t-xl blur-sm" />
        <img src="/bg-image-auth.png" alt="" className="container" />
      </div>
    </div>
  );
}
