import { api } from '..';

type SumaryResponse = Array<any>;
type ExamsListResponse = {
  exams: SumaryResponse;
};

export async function getAllExams(): Promise<SumaryResponse> {
  const { signal } = new AbortController();

  const { data } = await api.get<ExamsListResponse>(`/client/exams-list`, {
    signal,
  });

  return data.exams;
}
