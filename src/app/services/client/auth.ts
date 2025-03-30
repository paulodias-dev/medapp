import { AuthProps, AuthResponseProps } from '@/app/models';
import { api } from '..';

export async function auth(
  params: AuthProps,
): Promise<AuthResponseProps | null> {
  const controller = new AbortController();
  const { signal } = controller;

  const queryString = new URLSearchParams(
    params as Record<string, string>,
  ).toString();

  const url = `/client/auth?${queryString}`;

  const { data } = await api.post<AuthResponseProps>(url, { signal });

  return data;
}
