import { api } from '..';
import { ClinicalResultListItem } from '@/app/models';

type ExamsListResponse = {
  exams: ClinicalResultListItem[];
};

type ExamsListSimpleResponse = {
  data: Array<{
    id: number;
    aso_number: number | null;
    patient_name: string;
    type_result_name: string;
    status: number;
    public: boolean;
    created_at: string;
  }>;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export async function getAllExams(): Promise<ClinicalResultListItem[]> {
  try {
    const { signal } = new AbortController();

    const { data } = await api.get<ExamsListResponse>(`/client/exams-list`, {
      signal,
    });

    if (Array.isArray(data?.exams)) {
      return data.exams;
    }

    return [];
  } catch {
    return getAllExamsFallbackSimple();
  }
}

async function getAllExamsFallbackSimple(): Promise<ClinicalResultListItem[]> {
  const items: ClinicalResultListItem[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const { signal } = new AbortController();

    const { data } = await api.get<ExamsListSimpleResponse>(`/client/exams-list-simple`, {
      signal,
      params: {
        page,
        per_page: 100,
        sort_by: 'created_at',
        sort_order: 'desc',
      },
    });

    const batch = (data?.data ?? []).map((row): ClinicalResultListItem => ({
      id: row.id,
      aso_number: row.aso_number ?? null,
      aso_date: null,
      status: row.status,
      public: Boolean(row.public),
      created_at: row.created_at,
      updated_at: row.created_at,
      patient: {
        id: 0,
        name: row.patient_name ?? '-',
        phone1: null,
        email: null,
      },
      clinical_type_result: {
        id: 0,
        name: row.type_result_name ?? '-',
      },
    }));

    items.push(...batch);

    const currentPage = Number(data?.meta?.current_page ?? page);
    const lastPage = Number(data?.meta?.last_page ?? page);
    hasNextPage = currentPage < lastPage;
    page += 1;
  }

  return items;
}
