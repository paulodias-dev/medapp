import { SwitchTenantResponse, TenantSummary } from '@/app/models';

import { api } from '..';

export async function listTenants(): Promise<TenantSummary[]> {
  const { data } = await api.get<TenantSummary[]>('/client/list-tenants');
  return data;
}

export async function switchTenant(
  id: number | string,
): Promise<SwitchTenantResponse> {
  const { data } = await api.post<SwitchTenantResponse>(
    `/client/switch-tenant/${id}`,
  );

  return data;
}
