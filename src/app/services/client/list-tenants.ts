import { api } from '..';

export type TenantListItem = {
  id: number;
  name: string;
  name_fantasy: string;
  img: string | null;
  branch_id: number;
};

export async function listTenants(): Promise<TenantListItem[]> {
  const { data } = await api.get<TenantListItem[]>('/client/list-tenants');
  return data;
}
