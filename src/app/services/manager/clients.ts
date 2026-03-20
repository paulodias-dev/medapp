import { api } from '../index';

export type ClientData = {
  id: number;
  name: string;
  name_fantasy: string;
  cpf_cnpj: string;
  phone1: string;
  email: string;
  status: number;
  created_at: string;
};

export type PaginatedClients = {
  data: ClientData[];
  current_page: number;
  last_page: number;
  total: number;
};

export const getClients = async (page = 1, search = '') => {
  const response = await api.get<{ data: PaginatedClients }>(`manager/list-clients?page=${page}&search=${search}`);
  return response.data.data;
};
