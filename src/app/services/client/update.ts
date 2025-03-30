import { api } from '..';

export async function update(params: any): Promise<any> {
  const { signal } = new AbortController();

  const { data } = await api.put<any>(`/client/update/${params.id}`, {
    ...params,
    signal,
  });

  return data;
}
