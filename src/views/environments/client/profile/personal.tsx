import { VerifyTokenResponse } from '@/app/models';
import { clientService } from '@/app/services/client';
import {
  cepMask,
  cpfCnpjMask,
  maskICMS,
  maskRGIE,
  phoneMask,
  resolveClientAvatarUrl,
} from '@/app/utils';
import { ProfileAvatarPicker } from '@/views/components/profile-avatar-picker';
import { Badge } from '@/views/components/ui/badge';
import { Button } from '@/views/components/ui/button';
import { Form } from '@/views/components/ui/form';
import { InputFormItem } from '@/views/components/ui/input-form-item';
import { Label } from '@/views/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { SpinnerGap } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const schema = z.object({
  type: z.string().min(1, 'Selecione o tipo de pessoa'),
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
  img: z.string().optional(),
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

type ProfileFormData = z.infer<typeof schema>;

export function Personal() {
  const [data, setData] = useState<VerifyTokenResponse>();
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(
    null,
  );
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  const form = useForm<ProfileFormData>({
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
      img: '',
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
  const queryClient = useQueryClient();
  const personType = form.watch('type');
  const isPessoaJuridica = personType === 'J';
  const avatarValue = form.watch('img');
  const profileName = form.watch('name');
  const avatarPreview = localAvatarPreview || resolveClientAvatarUrl(avatarValue, data?.id);
  const accountStatus = resolveAccountStatus(data?.status);
  const createdAtLabel = formatDateTime(data?.created_at);
  const updatedAtLabel = formatDateTime(data?.updated_at);

  const submit = useMutation({
    mutationFn: async (params: ProfileFormData) => {
      if (!data) {
        throw new Error('Dados do perfil não carregados.');
      }

      const payload = { ...params };

      if (payload.type === 'F') {
        payload.name_fantasy = '';
        payload.legal_nature = '';
        payload.icms = '';
        payload.iest = '';
        payload.municipal_registration = '';
      }

      if (selectedAvatarFile) {
        const formDataPayload = buildUpdateFormData({
          ...payload,
          id: data.id,
          img_file: selectedAvatarFile,
        });
        await clientService.update(formDataPayload);
        return;
      }

      await clientService.update({ ...payload, id: data.id });
    },
    onSuccess: async () => {
      setSelectedAvatarFile(null);
      toast.success('Dados atualizados com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['profileHeaderAvatar'] });
      try {
        const refreshedProfile = await clientService.verifyToken();
        hydrateProfileForm(refreshedProfile, form, setData, setLocalAvatarPreview);
      } catch {
        // Keep local state as-is; header refetch still updates avatar globally.
      }
    },
    onError: (error) => {
      const parsedError = parseApiError(error);

      Object.entries(parsedError.fieldErrors).forEach(([field, message]) => {
        form.setError(field as keyof ProfileFormData, {
          type: 'server',
          message,
        });
      });

      toast.error('Erro ao atualizar os dados.', {
        description: parsedError.message,
      });
    },
  });

  function onSubmit(values: ProfileFormData) {
    form.clearErrors();
    submit.mutate(values);
  }

  useEffect(() => {
    clientService
      .verifyToken()
      .then((res) => {
        hydrateProfileForm(res, form, setData, setLocalAvatarPreview);
      })
      .catch(() => {
        toast.error('Não foi possível carregar os dados do perfil.');
      });
  }, []);

  useEffect(
    () => () => {
      if (localAvatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(localAvatarPreview);
      }
    },
    [localAvatarPreview],
  );

  function handlePickAvatar(file: File) {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido.', {
        description: 'Use apenas imagens PNG, JPG ou JPEG.',
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande.', {
        description: 'Selecione uma imagem de até 2MB.',
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return previewUrl;
    });
    setSelectedAvatarFile(file);
  }

  function handleRemoveAvatar() {
    setLocalAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setSelectedAvatarFile(null);
    form.setValue('img', '', { shouldDirty: true });
  }

  return (
    <div className="animate-slidein200 opacity-0 space-y-6">
      <section className="rounded-2xl border bg-gradient-to-r from-slate-50 to-white p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Dados Pessoais</h3>
        <p className="mt-1 text-sm text-slate-500">
          Atualize os dados da conta e mantenha as informações de contato e
          endereço sempre corretas.
        </p>
      </section>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border bg-white p-4 xl:sticky xl:top-24">
              <ProfileAvatarPicker
                src={avatarPreview}
                alt={profileName || 'Avatar do perfil'}
                onPickImage={handlePickAvatar}
                onRemoveImage={handleRemoveAvatar}
                disabled={submit.isPending}
              />

              <section className="mt-4 rounded-xl border bg-slate-50 p-4">
                <h5 className="text-sm font-semibold text-slate-900">Dados da conta</h5>

                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Status</span>
                    <Badge variant="outline" className={accountStatus.className}>
                      {accountStatus.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Criado em</span>
                    <span className="text-right text-slate-700">{createdAtLabel}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Atualizado em</span>
                    <span className="text-right text-slate-700">{updatedAtLabel}</span>
                  </div>
                </div>
              </section>
            </aside>

            <div className="space-y-6">
              <section className="rounded-2xl border bg-white p-5">
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-slate-900">
                    Identificação
                  </h4>
                  <p className="text-sm text-slate-500">
                    Defina o tipo da conta e os dados cadastrais principais.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label>
                      Tipo de pessoa
                      <span className="text-red-500">*</span>
                    </Label>

                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <Button
                        type="button"
                        variant={personType === 'F' ? 'default' : 'outline'}
                        className="rounded-xl"
                        onClick={() => form.setValue('type', 'F')}>
                        Pessoa Física
                      </Button>
                      <Button
                        type="button"
                        variant={personType === 'J' ? 'default' : 'outline'}
                        className="rounded-xl"
                        onClick={() => form.setValue('type', 'J')}>
                        Pessoa Jurídica
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <InputFormItem
                      control={form.control}
                      name="name"
                      label={isPessoaJuridica ? 'Razão social' : 'Nome completo'}
                      placeholder={
                        isPessoaJuridica
                          ? 'Digite a razão social'
                          : 'Digite o nome completo'
                      }
                      required
                    />
                  </div>

                  {isPessoaJuridica && (
                    <div className="md:col-span-2">
                      <InputFormItem
                        control={form.control}
                        name="name_fantasy"
                        label="Nome fantasia"
                        placeholder="Digite o nome fantasia (opcional)"
                      />
                    </div>
                  )}

                  <InputFormItem
                    control={form.control}
                    name="cpf_cnpj"
                    label={isPessoaJuridica ? 'CNPJ' : 'CPF'}
                    placeholder={isPessoaJuridica ? 'Digite o CNPJ' : 'Digite o CPF'}
                    onChange={(e) => {
                      form.setValue('cpf_cnpj', cpfCnpjMask(e.target.value));
                    }}
                    required
                  />

                  <InputFormItem
                    control={form.control}
                    name="rg_ie"
                    label={isPessoaJuridica ? 'Inscrição Estadual' : 'RG'}
                    onChange={(e) => {
                      form.setValue('rg_ie', maskRGIE(e.target.value));
                    }}
                    placeholder={
                      isPessoaJuridica
                        ? 'Digite a inscrição estadual (opcional)'
                        : 'Digite o RG (opcional)'
                    }
                  />

                  {isPessoaJuridica && (
                    <>
                      <div className="md:col-span-2">
                        <InputFormItem
                          control={form.control}
                          name="legal_nature"
                          label="Natureza Jurídica"
                          placeholder="Digite a natureza jurídica (opcional)"
                        />
                      </div>

                      <InputFormItem
                        control={form.control}
                        name="icms"
                        label="ICMS"
                        onChange={(e) => {
                          form.setValue('icms', maskICMS(e.target.value));
                        }}
                        placeholder="Digite o ICMS (opcional)"
                      />

                      <InputFormItem
                        control={form.control}
                        name="iest"
                        label="IEST"
                        onChange={(e) => {
                          form.setValue('iest', maskICMS(e.target.value));
                        }}
                        placeholder="Digite o IEST (opcional)"
                      />

                      <div className="md:col-span-2">
                        <InputFormItem
                          control={form.control}
                          name="municipal_registration"
                          label="Inscrição Municipal"
                          placeholder="Digite a inscrição municipal (opcional)"
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border bg-white p-5">
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-slate-900">Contato</h4>
                  <p className="text-sm text-slate-500">
                    Informações de comunicação da conta.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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

                  <InputFormItem
                    control={form.control}
                    name="phone2"
                    label="Telefone auxiliar"
                    placeholder="Digite o telefone auxiliar (opcional)"
                    onChange={(e) => {
                      form.setValue('phone2', phoneMask(e.target.value));
                    }}
                  />

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
                </div>
              </section>

              <section className="rounded-2xl border bg-white p-5">
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-slate-900">Endereço</h4>
                  <p className="text-sm text-slate-500">
                    Dados de localização e referência.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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

                  <InputFormItem
                    control={form.control}
                    name="number"
                    label="Número"
                    placeholder="Digite o número"
                    required
                  />

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

                  <InputFormItem
                    control={form.control}
                    name="city"
                    label="Cidade"
                    placeholder="Digite a cidade"
                    required
                  />

                  <InputFormItem
                    control={form.control}
                    name="state"
                    label="Estado"
                    placeholder="Digite o estado"
                    required
                  />

                  <InputFormItem
                    control={form.control}
                    name="ip_address"
                    label="Endereço IP"
                    placeholder="Digite o endereço IP (opcional)"
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button className="flex items-center gap-2" disabled={submit.isPending}>
              Salvar alterações
              {submit.isPending && <SpinnerGap className="h-4 w-4 animate-spin" />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

type ApiErrorResponse = {
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
  details?: Record<string, string[]>;
};

type ParsedApiError = {
  message: string;
  fieldErrors: Record<string, string>;
};

function parseApiError(error: unknown): ParsedApiError {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiErrorResponse | undefined;
    const details = response?.errors ?? response?.details;
    const fieldErrors: Record<string, string> = {};

    if (details) {
      Object.entries(details).forEach(([field, messages]) => {
        const firstMessage = messages?.[0];
        if (!firstMessage) return;
        fieldErrors[field] = normalizeFieldErrorMessage(field, firstMessage);
      });

      const firstFieldMessage = Object.values(fieldErrors)[0];
      if (firstFieldMessage) {
        return {
          message: firstFieldMessage,
          fieldErrors,
        };
      }
    }

    if (response?.message) {
      return {
        message: response.message,
        fieldErrors,
      };
    }

    if (response?.error) {
      return {
        message: response.error,
        fieldErrors,
      };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      fieldErrors: {},
    };
  }

  return {
    message: 'Tente novamente.',
    fieldErrors: {},
  };
}

function normalizeFieldErrorMessage(field: string, message: string): string {
  if (field === 'email' && /ja esta em uso|já está em uso|already been taken/i.test(message)) {
    return 'Este e-mail já está cadastrado para outro usuário.';
  }

  if (
    field === 'cpf_cnpj' &&
    /ja esta em uso|já está em uso|already been taken|cpf|cnpj/i.test(message)
  ) {
    return 'Este CPF/CNPJ já está cadastrado para outro usuário.';
  }

  if (field === 'img_file') {
    return 'A imagem deve ser PNG, JPG ou JPEG com até 2MB.';
  }

  return message;
}

function hydrateProfileForm(
  profile: VerifyTokenResponse,
  form: UseFormReturn<ProfileFormData>,
  setData: (value: VerifyTokenResponse) => void,
  setLocalAvatarPreview: (value: string | null) => void,
) {
  setLocalAvatarPreview(null);
  form.setValue('type', profile.type ?? '');
  form.setValue('name', profile.name ?? '');
  form.setValue('name_fantasy', profile.name_fantasy ?? '');
  form.setValue('cpf_cnpj', profile.cpf_cnpj ?? '');
  form.setValue('rg_ie', profile.rg_ie ?? '');
  form.setValue('legal_nature', profile.legal_nature ?? '');
  form.setValue('icms', profile.icms ?? '');
  form.setValue('iest', profile.iest ?? '');
  form.setValue('municipal_registration', profile.municipal_registration ?? '');
  form.setValue('phone1', profile.phone1 ?? '');
  form.setValue('phone2', profile.phone2 ?? '');
  form.setValue('email', profile.email ?? '');
  form.setValue('img', profile.img ?? '');
  form.setValue('url', profile.url ?? '');
  form.setValue('zipCode', profile.zipCode ?? '');
  form.setValue('public_place', profile.public_place ?? '');
  form.setValue('number', profile.number ?? '');
  form.setValue('complement', profile.complement ?? '');
  form.setValue('district', profile.district ?? '');
  form.setValue('city', profile.city ?? '');
  form.setValue('state', profile.state ?? '');
  form.setValue('ip_address', profile.ip_address ?? '');
  setData(profile);
}

function buildUpdateFormData(payload: Record<string, unknown>): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

type AccountStatusMeta = {
  label: string;
  className: string;
};

function resolveAccountStatus(status?: number): AccountStatusMeta {
  if (status === 1) {
    return {
      label: 'Ativo',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }

  if (status === 0) {
    return {
      label: 'Inativo',
      className: 'border-slate-200 bg-slate-100 text-slate-600',
    };
  }

  return {
    label: 'Pendente',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  };
}

function formatDateTime(value?: string | null): string {
  if (!value) return 'Não informado';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return 'Não informado';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsedDate);
}
