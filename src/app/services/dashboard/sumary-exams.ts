import { api } from '..';

type SumaryResponse = Array<any>;

export async function sumaryExams(): Promise<SumaryResponse> {
  const { signal } = new AbortController();

  const { data } = await api.get<SumaryResponse>(`/client/sumary-exams`, {
    signal,
  });

  return data;
}
