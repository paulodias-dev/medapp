import { InputFormItem } from '@/views/components/ui/input-form-item';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import * as z from 'zod';

import { Button } from '@/views/components/ui/button';
import { Form } from '@/views/components/ui/form';
import { Separator } from '@/views/components/ui/separator';
import { Eye, EyeSlash, SpinnerGap } from '@phosphor-icons/react';
import { useState } from 'react';

const schema = z
  .object({
    oldPassword: z.string(),
    password: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-zA-Z0-9]/, 'A senha deve conter letras e números'),
    confirmPassword: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-zA-Z0-9]/, 'A senha deve conter letras e números'),
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

import { clientService } from '@/app/services/client';
import { toast } from 'sonner';

export function Security() {
  const [currentPassword, setCurrentPassword] = useState(true);
  const [newPassword, setNewPassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState(true);

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
      toast.success('Senha atualizada com sucesso!');
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
    <div className="animate-slidein200 opacity-0 ">
      <div>
        <h3 className="text-lg font-medium">Atualizar senha</h3>
        <p className="text-sm text-muted-foreground">
          Altere a sua senha de acesso ao sistema.
        </p>
      </div>

      <Separator className="my-4" />

      <Form {...form}>
        <form
          className="w-full flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}>
          <InputFormItem
            control={form.control}
            name="oldPassword"
            label="Senha atual"
            placeholder="Insira a sua senha atual"
            description="Essa é a sua senha atual de acesso ao sistema."
            type={currentPassword ? 'password' : 'text'}
            actions={
              <button
                type="button"
                className="absolute right-4 top-2.5"
                onClick={() => setCurrentPassword((prev) => !prev)}>
                {currentPassword ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeSlash className="w-4 h-4" />
                )}
              </button>
            }
            required
          />

          <InputFormItem
            control={form.control}
            name="password"
            label="Nova senha"
            placeholder="Insira a sua nova senha"
            description="Essa será a sua nova senha de acesso ao sistema."
            type={newPassword ? 'password' : 'text'}
            actions={
              <button
                type="button"
                className="absolute right-4 top-2.5"
                onClick={() => setNewPassword((prev) => !prev)}>
                {newPassword ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeSlash className="w-4 h-4" />
                )}
              </button>
            }
            required
          />

          <InputFormItem
            control={form.control}
            name="confirmPassword"
            label="Confirmar nova senha"
            placeholder="Confirme a sua nova senha"
            description="Confirme a sua nova senha de acesso ao sistema."
            type={confirmPassword ? 'password' : 'text'}
            actions={
              <button
                type="button"
                className="absolute right-4 top-2.5"
                onClick={() => setConfirmPassword((prev) => !prev)}>
                {confirmPassword ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeSlash className="w-4 h-4" />
                )}
              </button>
            }
            required
          />

          <div className="py-4 gap-2">
            <Button className="flex items-center gap-2">
              Salvar nova senha
              {submit.isPending && (
                <SpinnerGap className="w-4 h-4 animate-spin" />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
