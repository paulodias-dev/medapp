import { ForgotPasswordProps } from '@/app/models';

import { api } from '..';

export async function forgotPassword(
  params: ForgotPasswordProps,
): Promise<string> {
  const { data } = await api.post(`/client/forgot-password`, params);

  return data.message;
}
