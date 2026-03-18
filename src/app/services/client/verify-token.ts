import { VerifyTokenResponse } from '@/app/models';

import { api } from '..';

export async function verifyToken(): Promise<VerifyTokenResponse> {
  const { signal } = new AbortController();

  const { data } = await api.post<VerifyTokenResponse>(`/verify-token`, null, {
    signal,
  });

  return data;
}
