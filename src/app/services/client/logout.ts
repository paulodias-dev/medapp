import { api } from '..';

export async function logout(): Promise<void> {
  await api.post('/client/logout');
}
