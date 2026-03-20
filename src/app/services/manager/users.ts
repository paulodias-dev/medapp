import { api } from '..';

export type UserData = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: number;
};

export type PaginatedUsers = {
  data: UserData[];
  current_page: number;
  last_page: number;
  total: number;
};

export const getUsers = async (page = 1, search = '') => {
  const { data } = await api.get('/manager/list-users', {
    params: { page, search },
  });
  return data.data;
};
