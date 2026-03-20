import { cn } from '@/app/utils';
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
import { Button } from '@/views/components/ui/button';
import { Form } from '@/views/components/ui/form';
import { InputFormItem } from '@/views/components/ui/input-form-item';
import { Label } from '@/views/components/ui/label';
import { Skeleton } from '@/views/components/ui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { 
  SpinnerGap, 
  User, 
  IdentificationCard, 
  Phone, 
  MapPin, 
  Info,
  CalendarBlank,
  CheckCircle,
  Buildings,
  Lightning,
  ArrowRight
} from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);
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
  const avatarPreview =
    localAvatarPreview ||
    resolveClientAvatarUrl(avatarValue, data?.id, data?.updated_at);
  const accountStatus = resolveAccountStatus(data?.status);
  const createdAtLabel = formatDateTime(data?.created_at);

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
        return clientService.update(formDataPayload);
      }

      return clientService.update({ ...payload, id: data.id });
    },
    onSuccess: async (response) => {
      setSelectedAvatarFile(null);
      if (response?.data) {
        hydrateProfileForm(response.data, form, setData, setLocalAvatarPreview);
        queryClient.setQueryData(['profileHeaderAvatar'], response.data);
      }

      await queryClient.invalidateQueries({ queryKey: ['profileHeaderAvatar'] });
      toast.success('Dados atualizados com sucesso.', {
        icon: <CheckCircle size={20} weight="fill" className="text-emerald-500" />,
      });
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
        setLoading(false);
      })
      .catch(() => {
        toast.error('Não foi possível carregar os dados do perfil.');
        setLoading(false);
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

  async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dataResponse = await response.json();

      if (dataResponse.erro) {
        toast.error('CEP não encontrado.');
        return;
      }

      form.setValue('public_place', dataResponse.logradouro, { shouldDirty: true });
      form.setValue('district', dataResponse.bairro, { shouldDirty: true });
      form.setValue('city', dataResponse.localidade, { shouldDirty: true });
      form.setValue('state', dataResponse.uf, { shouldDirty: true });

      form.setFocus('number');
    } catch (error) {
      toast.error('Erro ao buscar o CEP.');
    }
  }

  function handleRemoveAvatar() {
    setLocalAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setSelectedAvatarFile(null);
    form.setValue('img', '', { shouldDirty: true });
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid gap-8 xl:grid-cols-[260px_1fr]">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <div className="space-y-8">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      <header className="relative overflow-hidden rounded-[2rem] border bg-white p-8 shadow-sm">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest">
              <User size={20} weight="bold" />
              Perfil do Usuário
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dados Pessoais</h1>
            <p className="text-slate-500 max-w-lg font-medium">
              Gerencie suas informações cadastrais, endereço e dados de contato para manter sua conta atualizada.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-slate-50 border rounded-2xl px-5 py-3 flex items-center gap-3 shadow-inner">
                <div className={cn("h-3 w-3 rounded-full animate-pulse", accountStatus.label === 'Ativo' ? "bg-emerald-500" : "bg-amber-500")} />
                <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{accountStatus.label}</span>
             </div>
          </div>
        </div>
      </header>

      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-6 xl:sticky xl:top-24 h-fit">
              <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
                <ProfileAvatarPicker
                  src={avatarPreview}
                  alt={profileName || 'Avatar do perfil'}
                  onPickImage={handlePickAvatar}
                  onRemoveImage={handleRemoveAvatar}
                  disabled={submit.isPending}
                />
                
                <div className="mt-8 space-y-4">
                   <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500">
                        <CalendarBlank size={18} />
                        <span className="text-xs font-bold uppercase">Entrou em</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{createdAtLabel.split(',')[0]}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Lightning size={18} />
                        <span className="text-xs font-bold uppercase">Acesso IP</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-900 font-mono truncate max-w-[100px]" title={data?.ip_address || undefined}>
                        {data?.ip_address || '---'}
                      </span>
                   </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-blue-600 p-6 text-white shadow-lg shadow-blue-200">
                 <div className="flex items-center gap-2 mb-3">
                    <Info size={24} weight="fill" />
                    <h5 className="font-bold">Dica de Segurança</h5>
                 </div>
                 <p className="text-sm text-blue-50 font-medium leading-relaxed">
                    Mantenha seu e-mail sempre atualizado para receber notificações importantes sobre seus atestados.
                 </p>
              </div>
            </aside>

            <div className="space-y-8">
              <section className="rounded-[2.5rem] border bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <IdentificationCard size={28} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Identificação</h4>
                    <p className="text-sm text-slate-500 font-medium">Dados fundamentais do seu cadastro.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label className="text-slate-700 font-bold mb-3 block">Tipo de conta</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => form.setValue('type', 'F')}
                        className={cn(
                          "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold",
                          personType === 'F' 
                            ? "bg-blue-50 border-blue-600 text-blue-700 shadow-md" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <User size={20} weight={personType === 'F' ? "fill" : "regular"} />
                        Pessoa Física
                      </button>
                      <button
                        type="button"
                        onClick={() => form.setValue('type', 'J')}
                        className={cn(
                          "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold",
                          personType === 'J' 
                            ? "bg-blue-50 border-blue-600 text-blue-700 shadow-md" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <Buildings size={20} weight={personType === 'J' ? "fill" : "regular"} />
                        Pessoa Jurídica
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <InputFormItem
                      control={form.control}
                      name="name"
                      label={isPessoaJuridica ? 'Razão social' : 'Nome completo'}
                      placeholder={isPessoaJuridica ? 'Empresa LTDA' : 'Seu nome completo'}
                      required
                    />
                  </div>

                  {isPessoaJuridica && (
                    <div className="md:col-span-2">
                      <InputFormItem
                        control={form.control}
                        name="name_fantasy"
                        label="Nome fantasia"
                        placeholder="Nome da Marca"
                      />
                    </div>
                  )}

                  <InputFormItem
                    control={form.control}
                    name="cpf_cnpj"
                    label={isPessoaJuridica ? 'CNPJ' : 'CPF'}
                    placeholder={isPessoaJuridica ? '00.000.000/0000-00' : '000.000.000-00'}
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
                    placeholder="Documento de identidade"
                  />

                  {isPessoaJuridica && (
                    <>
                      <div className="md:col-span-2">
                        <InputFormItem
                          control={form.control}
                          name="legal_nature"
                          label="Natureza Jurídica"
                          placeholder="Ex: 206-2 - Sociedade Empresária Limitada"
                        />
                      </div>

                      <InputFormItem
                        control={form.control}
                        name="icms"
                        label="ICMS"
                        placeholder="Inscrição no ICMS"
                        onChange={(e) => {
                          form.setValue('icms', maskICMS(e.target.value));
                        }}
                      />

                      <InputFormItem
                        control={form.control}
                        name="iest"
                        label="IEST"
                        placeholder="Substituição Tributária"
                        onChange={(e) => {
                          form.setValue('iest', maskICMS(e.target.value));
                        }}
                      />

                      <div className="md:col-span-2">
                        <InputFormItem
                          control={form.control}
                          name="municipal_registration"
                          label="Inscrição Municipal"
                          placeholder="Número do registro municipal"
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section className="rounded-[2.5rem] border bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Phone size={28} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Contato</h4>
                    <p className="text-sm text-slate-500 font-medium">Como podemos falar com você.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <InputFormItem
                    control={form.control}
                    name="phone1"
                    label="WhatsApp / Principal"
                    placeholder="(00) 0 0000-0000"
                    onChange={(e) => {
                      form.setValue('phone1', phoneMask(e.target.value));
                    }}
                    required
                  />

                  <InputFormItem
                    control={form.control}
                    name="phone2"
                    label="Telefone adicional"
                    placeholder="(00) 0000-0000"
                    onChange={(e) => {
                      form.setValue('phone2', phoneMask(e.target.value));
                    }}
                  />

                  <div className="md:col-span-2">
                    <InputFormItem
                      control={form.control}
                      name="email"
                      label="Endereço de e-mail"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputFormItem
                      control={form.control}
                      name="url"
                      label="Website / Link profissional"
                      placeholder="https://exemplo.com.br"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[2.5rem] border bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MapPin size={28} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Endereço</h4>
                    <p className="text-sm text-slate-500 font-medium">Sua localização para registros legais.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-6">
                  <div className="md:col-span-3">
                    <InputFormItem
                      control={form.control}
                      name="zipCode"
                      label="CEP"
                      placeholder="00000-000"
                      onChange={(e) => {
                        form.setValue('zipCode', cepMask(e.target.value));
                      }}
                      onBlur={handleCepBlur}
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <InputFormItem
                      control={form.control}
                      name="number"
                      label="Número"
                      placeholder="123"
                      required
                    />
                  </div>

                  <div className="md:col-span-6">
                    <InputFormItem
                      control={form.control}
                      name="public_place"
                      label="Logradouro"
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div className="md:col-span-6">
                    <InputFormItem
                      control={form.control}
                      name="complement"
                      label="Complemento"
                      placeholder="Apartamento, Bloco, etc."
                    />
                  </div>

                  <div className="md:col-span-3">
                    <InputFormItem
                      control={form.control}
                      name="district"
                      label="Bairro"
                      placeholder="Nome do bairro"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputFormItem
                      control={form.control}
                      name="city"
                      label="Cidade"
                      placeholder="Localidade"
                      required
                    />
                  </div>

                  <div className="md:col-span-1">
                    <InputFormItem
                      control={form.control}
                      name="state"
                      label="UF"
                      placeholder="XX"
                      required
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-900 rounded-[2rem] p-6 shadow-2xl text-white">
             <div className="flex items-center gap-3 ml-4">
                <CheckCircle size={24} className="text-emerald-400" weight="fill" />
                <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Os dados serão validados após salvar</span>
             </div>
             <Button 
                size="lg"
                className="bg-white text-slate-950 hover:bg-blue-500 hover:text-white rounded-[1.5rem] px-10 h-16 text-lg font-bold shadow-xl active:scale-95 transition-all gap-3" 
                disabled={submit.isPending}
              >
              Salvar Alterações
              {submit.isPending ? (
                <SpinnerGap className="h-6 w-6 animate-spin" />
              ) : (
                <ArrowRight className="h-6 w-6" weight="bold" />
              )}
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
