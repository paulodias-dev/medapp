import { api } from '..';
import { ClinicalResultListItem } from '@/app/models';

type ExamsListResponse = {
  exams: ClinicalResultListItem[];
};

export async function getAllExams(): Promise<ClinicalResultListItem[]> {
  const { signal } = new AbortController();

  const { data } = await api.get<ExamsListResponse>(`/client/exams-list`, {
    signal,
  });

  return data.exams;
}
