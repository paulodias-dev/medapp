import { api } from '..';

type SumaryResponse = Array<any>;

export async function getAllExams(): Promise<SumaryResponse> {
  const { signal } = new AbortController();

  const { data } = await api.get<SumaryResponse>(`/client/exams-list-filters`, {
    signal,
  });

  return data;
}
