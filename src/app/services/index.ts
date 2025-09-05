import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://ssma-gestor.fluxosistemas.com.br/api/',
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30, // 30 seconds
    },
  },
});
