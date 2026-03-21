import { ClientPatientListItem } from '@/app/models';
import { cpfCnpjMask, maskRGIE, phoneMask } from '@/app/utils';

export type AppointmentEmployeeForm = {
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

export function digitsOnly(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export function cpfMask(value: string): string {
  return cpfCnpjMask(digitsOnly(value).slice(0, 11));
}

export function toInputDate(value: string | null | undefined): string {
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

export function normalizeGender(value: string | null | undefined): string {
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

export function normalizeMaritalStatus(value: string | null | undefined): string {
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

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidCpf(cpf: string): boolean {
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

export function validateEmployee(
  employee: AppointmentEmployeeForm,
): Partial<Record<keyof AppointmentEmployeeForm, string>> {
  const validationErrors: Partial<Record<keyof AppointmentEmployeeForm, string>> = {};

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

export function mapPatientAutofill(
  employee: AppointmentEmployeeForm,
  patient: ClientPatientListItem,
): AppointmentEmployeeForm {
  return {
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
  };
}

export function canSubmitAppointmentReview(
  selectedExams: string[],
  isReviewConfirmed: boolean,
  isSubmitting: boolean,
): boolean {
  return selectedExams.length > 0 && isReviewConfirmed && !isSubmitting;
}

