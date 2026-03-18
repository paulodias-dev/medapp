import { api } from '..';

type UpdatePayload = Record<string, any> | FormData;

export async function update(params: UpdatePayload): Promise<any> {
  const { signal } = new AbortController();
  let id: string | number | null = null;
  let payload: UpdatePayload;

  if (params instanceof FormData) {
    id = params.get('id') as string | null;
    const zipCode = params.get('zipCode');
    if (zipCode && !params.get('cep')) {
      params.set('cep', String(zipCode));
    }
    payload = params;
  } else {
    const { id: rawId, zipCode, ...rest } = params;
    id = rawId;
    payload = {
      id,
      ...rest,
      ...(zipCode ? { cep: zipCode, zipCode } : {}),
    };
  }

  if (!id) {
    throw new Error('ID do cliente não informado.');
  }

  const { data } = await api.put<any>(`/client/client/${id}`, payload, {
    signal,
  });

  return data;
}
