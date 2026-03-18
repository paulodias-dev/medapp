import { api } from '..';

type UpdatePayload = Record<string, any> | FormData;

export async function update(params: UpdatePayload): Promise<any> {
  const { signal } = new AbortController();
  let id: string | number | null = null;
  const payload = new FormData();

  if (params instanceof FormData) {
    id = params.get('id') as string | null;
    const zipCode = params.get('zipCode');
    if (zipCode && !params.get('cep')) {
      params.set('cep', String(zipCode));
    }

    params.forEach((value, key) => {
      if (key === '_method') return;
      payload.append(key, value);
    });
  } else {
    const { id: rawId, zipCode, ...rest } = params;
    id = rawId;

    Object.entries(rest).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      payload.append(key, String(value));
    });

    if (zipCode) {
      payload.set('zipCode', String(zipCode));
      if (!payload.get('cep')) {
        payload.set('cep', String(zipCode));
      }
    }
  }

  if (!id) {
    throw new Error('ID do cliente não informado.');
  }

  payload.set('id', String(id));
  payload.set('_method', 'PUT');

  const { data } = await api.post<any>(`/client/client/${id}`, payload, {
    signal,
  });

  return data;
}
