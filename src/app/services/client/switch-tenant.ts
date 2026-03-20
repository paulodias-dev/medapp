import { AuthResponseProps } from '@/app/models';
import { api } from '..';

export async function switchTenant(id: number): Promise<AuthResponseProps> {
  const { data } = await api.post<AuthResponseProps>(`/client/switch-tenant/${id}`);
  return data;
}
