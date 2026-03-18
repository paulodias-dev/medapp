import { api } from '..';

export type SumaryResponse = {
  total_exams: number | null;
  active_exams: number | null;
};

export async function sumaryExams(): Promise<SumaryResponse> {
  const { signal } = new AbortController();

  const { data } = await api.get<SumaryResponse>(`/client/sumary-exams`, {
    signal,
  });

  return data;
}
