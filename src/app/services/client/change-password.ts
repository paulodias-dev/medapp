import { api } from '..';

export interface ChangePasswordParams {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export async function changePassword(params: ChangePasswordParams) {
  const { data } = await api.post('/client/change-password', params);
  return data;
}
