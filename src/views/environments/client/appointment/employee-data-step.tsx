import { useAppointment } from '@/app/context/appointment-context';
import { ClientPatientListItem } from '@/app/models';
import { clientService } from '@/app/services/client';
import { cpfCnpjMask, maskRGIE, phoneMask } from '@/app/utils';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import { Label } from '@/views/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/views/components/ui/select';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Newspaper } from '@phosphor-icons/react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type LookupState = 'idle' | 'searching' | 'found' | 'not_found' | 'error';

type EmployeeFormData = {
  name: string;
  cpf: string;
  rg: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  position_id: number | null;
  department_id: number | null;
  email: string;
  phone: string;
  altPhone: string;
};

function digitsOnly(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

function cpfMask(value: string): string {
  return cpfCnpjMask(digitsOnly(value).slice(0, 11));
}

function toInputDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const [day, month, year] = value.split('/');
  if (!day || !month || !year) {
    return '';
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function normalizeGender(value: string | null | undefined): string {
  const normalizedValue = (value ?? '').trim().toLowerCase();

  if (normalizedValue === 'm' || normalizedValue === 'masculino') {
    return 'Masculino';
  }

  if (normalizedValue === 'f' || normalizedValue === 'feminino') {
    return 'Feminino';
  }

  if (normalizedValue === 'outro' || normalizedValue === 'nao-binario') {
    return 'Outro';
  }

  return '';
}

function normalizeMaritalStatus(value: string | null | undefined): string {
  const normalizedValue = (value ?? '').trim().toLowerCase();

  const map: Record<string, string> = {
    solteiro: 'Solteiro(a)',
    solteira: 'Solteiro(a)',
    'solteiro(a)': 'Solteiro(a)',
    casado: 'Casado(a)',
    casada: 'Casado(a)',
    'casado(a)': 'Casado(a)',
    divorciado: 'Divorciado(a)',
    divorciada: 'Divorciado(a)',
    'divorciado(a)': 'Divorciado(a)',
    viuvo: 'Viúvo(a)',
    viuva: 'Viúvo(a)',
    'viúvo(a)': 'Viúvo(a)',
    'uniao estavel': 'União Estável',
    'união estável': 'União Estável',
  };

  return map[normalizedValue] ?? '';
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidCpf(cpf: string): boolean {
  const normalizedCpf = digitsOnly(cpf);

  if (normalizedCpf.length !== 11 || /^(\d)\1{10}$/.test(normalizedCpf)) {
    return false;
  }

  const calculateVerifier = (base: string, factor: number): number => {
    const total = base.split('').reduce((accumulator, digit) => {
      return accumulator + Number(digit) * factor--;
    }, 0);

    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstVerifier = calculateVerifier(normalizedCpf.slice(0, 9), 10);
  const secondVerifier = calculateVerifier(normalizedCpf.slice(0, 10), 11);

  return (
    firstVerifier === Number(normalizedCpf.charAt(9)) &&
    secondVerifier === Number(normalizedCpf.charAt(10))
  );
}

function validateEmployee(employee: EmployeeFormData): Partial<Record<keyof EmployeeFormData, string>> {
  const validationErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

  if (employee.name.trim().length < 3) {
    validationErrors.name = 'Informe o nome completo do colaborador.';
  }

  if (!isValidCpf(employee.cpf)) {
    validationErrors.cpf = 'Informe um CPF válido.';
  }

  if (digitsOnly(employee.rg).length < 5) {
    validationErrors.rg = 'Informe um RG válido.';
  }

  if (!employee.birthDate) {
    validationErrors.birthDate = 'Informe a data de nascimento.';
  } else if (new Date(employee.birthDate) > new Date()) {
    validationErrors.birthDate = 'A data de nascimento não pode estar no futuro.';
  }

  if (!employee.gender) {
    validationErrors.gender = 'Selecione o sexo.';
  }

  if (!employee.maritalStatus) {
    validationErrors.maritalStatus = 'Selecione o estado civil.';
  }

  if (!employee.position_id) {
    validationErrors.position_id = 'Selecione a função/cargo.';
  }

  if (!employee.department_id) {
    validationErrors.department_id = 'Selecione o departamento/setor.';
  }

  if (!isValidEmail(employee.email.trim())) {
    validationErrors.email = 'Informe um e-mail válido.';
  }

  const phoneDigits = digitsOnly(employee.phone);
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    validationErrors.phone = 'Informe um telefone principal válido.';
  }

  const altPhoneDigits = digitsOnly(employee.altPhone);
  if (altPhoneDigits && (altPhoneDigits.length < 10 || altPhoneDigits.length > 11)) {
    validationErrors.altPhone = 'Telefone auxiliar inválido.';
  }

  return validationErrors;
}

export function EmployeeDataStep() {
  const navigate = useNavigate();
  const { data: appointmentData, setStepData } = useAppointment();
  const employee = appointmentData.employee;

  const [lookupState, setLookupState] = useState<LookupState>('idle');
  const [lookupMessage, setLookupMessage] = useState('');
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const lastSearchedCpfRef = useRef('');

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: clientService.masterData.getDepartments,
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: clientService.masterData.getPositions,
  });

  const updateEmployee = (field: keyof typeof employee, value: string | number | null) => {
    setStepData('employee', { ...employee, [field]: value });
  };

  const applyPatientAutofill = (patient: ClientPatientListItem) => {
    setStepData('patientId', patient.id);
    setStepData('employee', {
      ...employee,
      name: patient.name ?? employee.name,
      cpf: cpfMask(patient.cpf ?? employee.cpf),
      rg: patient.rg ? maskRGIE(patient.rg) : employee.rg,
      birthDate: toInputDate(patient.date_of_birth),
      gender: normalizeGender(patient.gender),
      maritalStatus: normalizeMaritalStatus(patient.marital_status),
      email: patient.email ?? employee.email,
      phone: patient.phone1 ? phoneMask(patient.phone1) : employee.phone,
      altPhone: patient.phone2 ? phoneMask(patient.phone2) : employee.altPhone,
    });
  };

  const { mutate: lookupPatientByCpfMutate } = useMutation({
    mutationFn: (cpf: string) => clientService.getPatientByCpf(cpf),
    onMutate: () => {
      setLookupState('searching');
      setLookupMessage('Buscando colaborador por CPF...');
    },
    onSuccess: (patient) => {
      if (!patient) {
        setStepData('patientId', null);
        setLookupState('not_found');
        setLookupMessage('CPF não encontrado. Continue preenchendo para novo cadastro.');
        return;
      }

      applyPatientAutofill(patient);
      setLookupState('found');
      setLookupMessage(`Colaborador encontrado: ${patient.name}. Dados preenchidos automaticamente.`);
    },
    onError: () => {
      setLookupState('error');
      setLookupMessage('Não foi possível consultar o CPF neste momento.');
    },
  });

  useEffect(() => {
    const normalizedCpf = digitsOnly(employee.cpf);

    if (normalizedCpf.length !== 11) {
      if (appointmentData.patientId !== null) {
        setStepData('patientId', null);
      }

      setLookupState('idle');
      setLookupMessage('');
      lastSearchedCpfRef.current = '';
      return;
    }

    if (!isValidCpf(normalizedCpf)) {
      if (appointmentData.patientId !== null) {
        setStepData('patientId', null);
      }

      setLookupState('idle');
      setLookupMessage('');
      return;
    }

    if (normalizedCpf === lastSearchedCpfRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastSearchedCpfRef.current = normalizedCpf;
      lookupPatientByCpfMutate(normalizedCpf);
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appointmentData.patientId, employee.cpf, lookupPatientByCpfMutate, setStepData]);

  const handleCpfChange = (value: string) => {
    const maskedCpf = cpfMask(value);
    updateEmployee('cpf', maskedCpf);

    if (appointmentData.patientId !== null) {
      setStepData('patientId', null);
    }
  };

  const validationErrors = useMemo(
    () => validateEmployee(employee),
    [employee],
  );

  const isFormValid = useMemo(
    () => Object.keys(validationErrors).length === 0,
    [validationErrors],
  );

  const handleContinue = () => {
    setShowFieldErrors(true);

    if (!isFormValid) {
      toast.error('Corrija os campos destacados para continuar.');
      return;
    }

    navigate('/certificate/type');
  };

  const inputErrorClass = 'border-red-500 focus-visible:ring-red-500';

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Etapa 2 de 4
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Dados do colaborador
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Informe os dados do colaborador para continuar a solicitação.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-xl flex items-center justify-center gap-2 w-full md:w-auto">
            Contrato
            <Newspaper size={18} />
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <section className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6">
          <form className="w-full flex flex-col gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  CPF
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="000.000.000-00"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.cpf ? inputErrorClass : ''
                  }`}
                  value={employee.cpf}
                  onChange={(e) => handleCpfChange(e.target.value)}
                />
                {lookupState !== 'idle' && (
                  <p
                    className={`text-xs font-medium ${
                      lookupState === 'found'
                        ? 'text-emerald-600'
                        : lookupState === 'error'
                          ? 'text-red-600'
                          : 'text-slate-500'
                    }`}>
                    {lookupState === 'searching' && (
                      <Loader2 className="inline-block mr-1 h-3 w-3 animate-spin" />
                    )}
                    {lookupMessage}
                  </p>
                )}
                {showFieldErrors && validationErrors.cpf && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.cpf}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Nome completo
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Informe o nome completo"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.name ? inputErrorClass : ''
                  }`}
                  value={employee.name}
                  onChange={(e) => updateEmployee('name', e.target.value)}
                />
                {showFieldErrors && validationErrors.name && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.name}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  Identidade (RG)
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Informe o número da identidade"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.rg ? inputErrorClass : ''
                  }`}
                  value={employee.rg}
                  onChange={(e) => updateEmployee('rg', maskRGIE(e.target.value))}
                />
                {showFieldErrors && validationErrors.rg && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.rg}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Estado civil
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.maritalStatus}
                  onValueChange={(value) => updateEmployee('maritalStatus', value)}>
                  <SelectTrigger
                    className={`w-full rounded-xl ${
                      showFieldErrors && validationErrors.maritalStatus ? inputErrorClass : ''
                    }`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                    <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                    <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                    <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                    <SelectItem value="União Estável">União Estável</SelectItem>
                  </SelectContent>
                </Select>
                {showFieldErrors && validationErrors.maritalStatus && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.maritalStatus}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  Data de nascimento
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.birthDate ? inputErrorClass : ''
                  }`}
                  value={employee.birthDate}
                  onChange={(e) => updateEmployee('birthDate', e.target.value)}
                />
                {showFieldErrors && validationErrors.birthDate && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.birthDate}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Sexo
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.gender}
                  onValueChange={(value) => updateEmployee('gender', value)}>
                  <SelectTrigger
                    className={`w-full rounded-xl ${
                      showFieldErrors && validationErrors.gender ? inputErrorClass : ''
                    }`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {showFieldErrors && validationErrors.gender && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.gender}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  Função/Cargo
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.position_id ? String(employee.position_id) : ''}
                  onValueChange={(value) => updateEmployee('position_id', Number(value))}>
                  <SelectTrigger
                    className={`w-full rounded-xl ${
                      showFieldErrors && validationErrors.position_id ? inputErrorClass : ''
                    }`}>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position: { id: number; name: string }) => (
                      <SelectItem key={position.id} value={String(position.id)}>
                        {position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showFieldErrors && validationErrors.position_id && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.position_id}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Departamento/Setor
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.department_id ? String(employee.department_id) : ''}
                  onValueChange={(value) => updateEmployee('department_id', Number(value))}>
                  <SelectTrigger
                    className={`w-full rounded-xl ${
                      showFieldErrors && validationErrors.department_id ? inputErrorClass : ''
                    }`}>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department: { id: number; name: string }) => (
                      <SelectItem key={department.id} value={String(department.id)}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showFieldErrors && validationErrors.department_id && (
                  <p className="text-xs font-medium text-red-600">
                    {validationErrors.department_id}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>
                E-mail
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="Informe o e-mail"
                className={`w-full rounded-xl ${
                  showFieldErrors && validationErrors.email ? inputErrorClass : ''
                }`}
                value={employee.email}
                onChange={(e) => updateEmployee('email', e.target.value)}
              />
              {showFieldErrors && validationErrors.email && (
                <p className="text-xs font-medium text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  Telefone principal
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="(00) 00000-0000"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.phone ? inputErrorClass : ''
                  }`}
                  value={employee.phone}
                  onChange={(e) => updateEmployee('phone', phoneMask(e.target.value))}
                />
                {showFieldErrors && validationErrors.phone && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.phone}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Telefone auxiliar</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.altPhone ? inputErrorClass : ''
                  }`}
                  value={employee.altPhone}
                  onChange={(e) => updateEmployee('altPhone', phoneMask(e.target.value))}
                />
                {showFieldErrors && validationErrors.altPhone && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.altPhone}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end border-t border-slate-100 pt-5 mt-2">
              <Button
                type="button"
                onClick={() => navigate(-1)}
                variant="ghost"
                className="rounded-xl">
                Voltar
              </Button>

              <Button
                type="button"
                onClick={handleContinue}
                disabled={!isFormValid}
                className="rounded-xl gap-1">
                Continuar
                <ArrowUpRight className="w-4" />
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
