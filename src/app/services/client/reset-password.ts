import { api } from '..';

type ResetPasswordProps = {
  token: string;
  password: string;
  password_confirmation: string;
};

type ResetPasswordResponse = {
  message: string;
};

export async function resetPassword(
  params: ResetPasswordProps,
): Promise<string> {
  const { data } = await api.post<ResetPasswordResponse>(
    `/client/reset-password`,
    params,
  );

  return data.message;
}
