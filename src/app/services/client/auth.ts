import { AuthProps, AuthResponseProps } from '@/app/models';
import { api } from '..';

export async function auth(
  params: AuthProps,
): Promise<AuthResponseProps | null> {
  const { signal } = new AbortController();
  const { data } = await api.post<AuthResponseProps>(`/client/auth`, params, {
    signal,
  });

  return data;
}
