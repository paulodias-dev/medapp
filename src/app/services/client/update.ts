import { api } from '..';

export async function update(params: any): Promise<any> {
  const { signal } = new AbortController();
  const { id, zipCode, ...rest } = params;

  const payload = {
    id,
    ...rest,
    ...(zipCode ? { cep: zipCode, zipCode } : {}),
  };
  const { data } = await api.put<any>(`/client/client/${id}`, payload, {
    signal,
  });

  return data;
}
