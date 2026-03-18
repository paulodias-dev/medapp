import { api } from '..';
import { VerifyTokenResponse } from '@/app/models';

type UpdatePayload = Record<string, any> | FormData;
type UpdateResponse = {
  message: string;
  data: VerifyTokenResponse;
};

export async function update(params: UpdatePayload): Promise<UpdateResponse> {
  const { signal } = new AbortController();
  let id: string | number | null = null;
  let payload: FormData;

  if (params instanceof FormData) {
    id = params.get('id') as string | null;
    const zipCode = params.get('zipCode');
    if (zipCode && !params.get('cep')) {
      params.set('cep', String(zipCode));
    }
    payload = params;
  } else {
    payload = new FormData();
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

  const { data } = await api.post<UpdateResponse>(`/client/client/${id}`, payload, {
    signal,
  });

  return data;
}
