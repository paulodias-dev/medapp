import { VerifyTokenResponse } from '@/app/models';
import { clientService } from '@/app/services/client';
import { cepMask, cpfCnpjMask, maskICMS, maskRGIE, phoneMask } from '@/app/utils';
import { Button } from '@/views/components/ui/button';
import { Form } from '@/views/components/ui/form';
import { InputFormItem } from '@/views/components/ui/input-form-item';
import { Label } from '@/views/components/ui/label';
import { Separator } from '@/views/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { SpinnerGap } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const schema = z.object({
  type: z.string().optional(),
  name: z.string().min(1, 'O nome completo é obrigatório'),
  name_fantasy: z.string().optional(),
  cpf_cnpj: z.string().optional(),
  rg_ie: z.string().optional(),
  legal_nature: z.string().optional(),
  icms: z.string().optional(),
  iest: z.string().optional(),
  municipal_registration: z.string().optional(),
  phone1: z.string().min(14, 'O telefone principal é obrigatório'),
  phone2: z.string().optional(),
  email: z.string().email('Digite um e-mail válido'),
  url: z.string().optional(),
  zipCode: z.string().min(9, 'O CEP deve ter no mínimo 9 caracteres'),
  public_place: z.string().optional(),
  number: z.string().min(1, 'O número é obrigatório'),
  complement: z.string().optional(),
  district: z.string().min(1, 'O bairro é obrigatório'),
  city: z.string().min(1, 'A cidade é obrigatória'),
  state: z.string().min(2, 'O estado é obrigatório'),
  ip_address: z.string().optional(),
});

export function Personal() {
  const [data, setData] = useState<VerifyTokenResponse>();

  const form = useForm<z.infer<typeof schema>>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    defaultValues: {
      type: '',
      name: '',
      name_fantasy: '',
      cpf_cnpj: '',
      rg_ie: '',
      legal_nature: '',
      icms: '',
      iest: '',
      municipal_registration: '',
      phone1: '',
      phone2: '',
      email: '',
      url: '',
      zipCode: '',
      public_place: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      ip_address: '',
    },
  });

  type FormData = z.infer<typeof schema>;

  const submit = useMutation({
    mutationFn: async (params: FormData) => {
      try {
        if (data) {
          await clientService.update({ ...params, id: data.id });
        } else {
          toast.error('Erro: dados não carregados');
        }

        toast.success('Dados atualizados com sucesso');
      } catch (error) {
        toast.error('Erro ao atualizar os dados');
      }
    },
  });

  function onSubmit(values: FormData) {
    submit.mutate(values);
  }

  useEffect(() => {
    clientService.verifyToken().then((res) => {
      form.setValue('type', res.type ?? '');
      form.setValue('name', res.name ?? '');
      form.setValue('name_fantasy', res.name_fantasy ?? '');
      form.setValue('cpf_cnpj', res.cpf_cnpj ?? '');
      form.setValue('rg_ie', res.rg_ie ?? '');
      form.setValue('legal_nature', res.legal_nature ?? '');
      form.setValue('icms', res.icms ?? '');
      form.setValue('iest', res.iest ?? '');
      form.setValue('municipal_registration', res.municipal_registration ?? '');
      form.setValue('phone1', res.phone1 ?? '');
      form.setValue('phone2', res.phone2 ?? '');
      form.setValue('email', res.email ?? '');
      form.setValue('url', res.url ?? '');
      form.setValue('zipCode', res.zipCode ?? '');
      form.setValue('public_place', res.public_place ?? '');
      form.setValue('number', res.number ?? '');
      form.setValue('complement', res.complement ?? '');
      form.setValue('district', res.district ?? '');
      form.setValue('city', res.city ?? '');
      form.setValue('state', res.state ?? '');
      form.setValue('ip_address', res.ip_address ?? '');

      setData(res);
    });
  }, []);

  return (
    <div className="animate-slidein200 opacity-0">
      <div>
        <h3 className="text-lg font-medium">Dados Pessoais</h3>
        <p className="text-sm text-gray-400">
          Informe o endereço de correspondência.
        </p>
      </div>

      <Separator className="my-4" />

      <Form {...form}>
        <form
          className="w-full flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label>
              Tipo de pessoa
              <span className="text-red-500">*</span>
            </Label>

            <div className="flex gap-4">
              <Button
                type="button"
                variant={form.watch('type') === 'F' ? 'default' : 'outline'}
                className="w-full rounded-xl"
                onClick={() => form.setValue('type', 'F')}>
                Pessoa Física
              </Button>
              <Button
                type="button"
                variant={form.watch('type') === 'J' ? 'default' : 'outline'}
                className="w-full rounded-xl"
                onClick={() => form.setValue('type', 'J')}>
                Pessoa Jurídica
              </Button>
            </div>
          </div>

          <InputFormItem
            control={form.control}
            name="name"
            label="Nome completo"
            placeholder="Digite o nome completo"
            required
          />

          <InputFormItem
            control={form.control}
            name="name_fantasy"
            label="Nome fantasia"
            placeholder="Digite o nome fantasia (opcional)"
          />

          <div className="flex gap-4">
            <div className="w-full flex flex-col gap-2">
              <InputFormItem
                control={form.control}
                name="cpf_cnpj"
                label="CPF/CNPJ"
                placeholder="Digite o CPF ou CNPJ"
                onChange={(e) => {
                  form.setValue('cpf_cnpj', cpfCnpjMask(e.target.value));
                }}
                required
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <InputFormItem
                control={form.control}
                name="rg_ie"
                label="RG/IE"
                onChange={(e) => {
                  form.setValue('rg_ie', maskRGIE(e.target.value));
                }}
                placeholder="Digite o RG ou IE (opcional)"
              />
            </div>
          </div>

          <InputFormItem
            control={form.control}
            name="legal_nature"
            label="Natureza Jurídica"
            placeholder="Digite a natureza jurídica (opcional)"
          />

          <div className="flex gap-4">
            <div className="w-full flex flex-col gap-2">
              <InputFormItem
                control={form.control}
                name="icms"
                label="ICMS"
                onChange={(e) => {
                  form.setValue('icms', maskICMS(e.target.value));
                }}
                placeholder="Digite o ICMS (opcional)"
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <InputFormItem
                control={form.control}
                name="iest"
                label="IEST"
                onChange={(e) => {
                  form.setValue('iest', maskICMS(e.target.value));
                }}
                placeholder="Digite o IEST (opcional)"
              />
            </div>
          </div>

          <InputFormItem
            control={form.control}
            name="municipal_registration"
            label="Inscrição Municipal"
            placeholder="Digite a inscrição municipal (opcional)"
          />

          <div className="flex gap-4">
            <div className="w-full flex flex-col gap-2">
              <InputFormItem
                control={form.control}
                name="phone1"
                label="Telefone principal"
                placeholder="Digite o telefone principal"
                onChange={(e) => {
                  form.setValue('phone1', phoneMask(e.target.value));
                }}
                required
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <InputFormItem
                control={form.control}
                name="phone2"
                label="Telefone auxiliar"
                placeholder="Digite o telefone auxiliar (opcional)"
                onChange={(e) => {
                  form.setValue('phone2', phoneMask(e.target.value));
                }}
              />
            </div>
          </div>

          <InputFormItem
            control={form.control}
            name="email"
            label="E-mail"
            placeholder="Digite o e-mail"
            required
          />

          <InputFormItem
            control={form.control}
            name="url"
            label="URL"
            placeholder="Digite a URL (opcional)"
          />

          <div className="pb-4 border-b">
            <h3 className="text-base font-medium">Endereço</h3>
            <p className="text-sm text-gray-400">
              Informe o endereço de correspondência.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="w-full flex flex-col gap-2">
              <InputFormItem
                control={form.control}
                name="zipCode"
                label="CEP"
                placeholder="Digite o CEP"
                onChange={(e) => {
                  form.setValue('zipCode', cepMask(e.target.value));
                }}
                required
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <InputFormItem
                control={form.control}
                name="number"
                label="Número"
                placeholder="Digite o número"
                required
              />
            </div>
          </div>

          <InputFormItem
            control={form.control}
            name="public_place"
            label="Logradouro"
            placeholder="Digite o logradouro (opcional)"
          />

          <InputFormItem
            control={form.control}
            name="complement"
            label="Complemento"
            placeholder="Digite o complemento (opcional)"
          />

          <InputFormItem
            control={form.control}
            name="district"
            label="Bairro"
            placeholder="Digite o bairro"
            required
          />

          <div className="flex gap-4">
            <div className="w-full flex flex-col gap-2">
              <InputFormItem
                control={form.control}
                name="city"
                label="Cidade"
                placeholder="Digite a cidade"
                required
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <InputFormItem
                control={form.control}
                name="state"
                label="Estado"
                placeholder="Digite o estado"
                required
              />
            </div>
          </div>

          <InputFormItem
            control={form.control}
            name="ip_address"
            label="Endereço IP"
            placeholder="Digite o endereço IP (opcional)"
          />

          <div className="py-4 gap-2">
            <Button className="flex items-center gap-2">
              Enviar atualizações
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
