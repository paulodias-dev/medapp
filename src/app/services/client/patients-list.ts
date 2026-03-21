import { ClientPatientListItem, ClientPatientsListResponse } from '@/app/models';
import { api } from '..';

export async function getPatientsList(
  params?: { search?: string; per_page?: number },
): Promise<ClientPatientListItem[]> {
  const { signal } = new AbortController();

  const { data } = await api.get<ClientPatientsListResponse>('/client/patients', {
    signal,
    params,
  });

  return data?.patients ?? [];
}
