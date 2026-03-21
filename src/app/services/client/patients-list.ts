import { ClientPatientListItem, ClientPatientsListResponse } from '@/app/models';
import { api } from '..';

function digitsOnly(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export async function getPatientsList(
  params?: { search?: string; per_page?: number },
): Promise<ClientPatientListItem[]> {
  const { signal } = new AbortController();

  const { data } = await api.get<ClientPatientsListResponse>('client/patients', {
    signal,
    params,
  });

  const rawData = data as unknown as {
    patients?: ClientPatientListItem[];
    data?: ClientPatientListItem[];
  } | ClientPatientListItem[];

  if (Array.isArray(rawData)) {
    return rawData;
  }

  if (Array.isArray(rawData?.patients)) {
    return rawData.patients;
  }

  if (Array.isArray(rawData?.data)) {
    return rawData.data;
  }

  return [];
}

export async function getPatientByCpf(cpf: string): Promise<ClientPatientListItem | null> {
  const normalizedCpf = digitsOnly(cpf);
  if (normalizedCpf.length !== 11) {
    return null;
  }

  const patients = await getPatientsList({
    search: normalizedCpf,
    per_page: 200,
  });

  return (
    patients.find((patient) => digitsOnly(patient.cpf) === normalizedCpf) ??
    null
  );
}
