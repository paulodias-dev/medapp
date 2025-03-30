import { api } from '..';

type ResetPasswordProps = {
  token: string;
  password: string;
  password_confirmation: string;
};

export async function resetPassword(params: ResetPasswordProps): Promise<void> {
  await api.post(`/auth/requestresetpassword`, params);
}
