import { api } from '..';

export type AppointmentEmployeeData = {
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

export type StoreExamPayload = {
  date: string | null;
  time: string | null;
  patientId: number | null;
  employee: AppointmentEmployeeData;
  type_id: number | null;
  exams: string[];
  observations: string;
};

function digitsOnly(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

function normalizeString(value: string | null | undefined): string | undefined {
  const normalizedValue = (value ?? '').trim();
  return normalizedValue === '' ? undefined : normalizedValue;
}

function normalizeExamIds(exams: string[]): number[] {
  return exams
    .map((examId) => Number(examId))
    .filter((examId) => Number.isFinite(examId) && examId > 0);
}

export async function getSchedules(date?: string) {
  const { data } = await api.get('client/get-schedules', {
    params: { date },
  });
  return data.available_schedules;
}

export async function storeExam(payload: StoreExamPayload) {
  const { employee } = payload;

  const requestPayload = {
    patient_id: payload.patientId ?? undefined,
    name: normalizeString(employee.name),
    cpf: normalizeString(digitsOnly(employee.cpf)),
    rg: normalizeString(employee.rg),
    date_of_birth: normalizeString(employee.birthDate),
    gender: normalizeString(employee.gender),
    marital_status: normalizeString(employee.maritalStatus),
    email: normalizeString(employee.email),
    phone1: normalizeString(digitsOnly(employee.phone)),
    phone2: normalizeString(digitsOnly(employee.altPhone)),
    department_id: employee.department_id ?? undefined,
    position_id: employee.position_id ?? undefined,
    clinical_type_result_id: payload.type_id ?? undefined,
    aso_date: payload.date ?? undefined,
    observation: normalizeString(payload.observations),
    comment: payload.time ? `Horário solicitado: ${payload.time}` : undefined,
    exams: normalizeExamIds(payload.exams),
  };

  const { data } = await api.post('client/exam-store', requestPayload);
  return data;
}
