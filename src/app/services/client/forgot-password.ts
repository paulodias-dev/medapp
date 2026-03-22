import { ForgotPasswordProps, ForgotPasswordResponse } from '@/app/models';

import { api } from '..';

export async function forgotPassword(
  params: ForgotPasswordProps,
): Promise<ForgotPasswordResponse> {
  const { data } = await api.post<ForgotPasswordResponse>(`/client/forgot-password`, params);

  return data;
}
