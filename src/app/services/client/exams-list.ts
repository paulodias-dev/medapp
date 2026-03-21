import { api } from '..';
import { ClinicalResultListItem } from '@/app/models';

type ApiExamListRow = Partial<ClinicalResultListItem> & {
  patient_name?: string;
  patient_phone1?: string | null;
  patient_email?: string | null;
  type_result_name?: string;
  clinicalTypeResult?: {
    id?: number;
    name?: string;
  };
};

type ExamsListResponse = {
  exams?: ApiExamListRow[];
  data?: ApiExamListRow[];
} | ApiExamListRow[];

type ExamsListSimpleResponse = {
  data?: ApiExamListRow[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeExamRow(row: ApiExamListRow, index: number): ClinicalResultListItem {
  const id = toNumberOrNull(row.id) ?? index + 1;
  const asoNumber = toNumberOrNull(row.aso_number);
  const asoDate = row.aso_date ?? null;

  const patientName = row.patient?.name ?? row.patient_name ?? '-';
  const patientPhone = row.patient?.phone1 ?? row.patient_phone1 ?? null;
  const patientEmail = row.patient?.email ?? row.patient_email ?? null;

  const typeResultSource = row.clinical_type_result ?? row.clinicalTypeResult;
  const typeResultName = typeResultSource?.name ?? row.type_result_name ?? '-';
  const typeResultId = toNumberOrNull(typeResultSource?.id) ?? 0;

  const createdAt = row.created_at ?? row.updated_at ?? new Date().toISOString();
  const updatedAt = row.updated_at ?? row.created_at ?? createdAt;

  return {
    id,
    aso_number: asoNumber,
    aso_date: asoDate,
    status: Number(row.status ?? 0),
    public: Boolean(row.public),
    created_at: createdAt,
    updated_at: updatedAt,
    patient: {
      id: toNumberOrNull(row.patient?.id) ?? 0,
      name: patientName,
      phone1: patientPhone,
      email: patientEmail,
    },
    clinical_type_result: {
      id: typeResultId,
      name: typeResultName,
    },
  };
}

function extractRowsFromResponse(response: ExamsListResponse): ApiExamListRow[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.exams)) return response.exams;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export async function getAllExams(): Promise<ClinicalResultListItem[]> {
  try {
    const { data } = await api.get<ExamsListResponse>('/client/exams-list');
    const rows = extractRowsFromResponse(data);

    if (rows.length > 0) {
      return rows.map(normalizeExamRow);
    }

    throw new Error('Contrato inválido de /client/exams-list');
  } catch {
    return getAllExamsFallbackSimple();
  }
}

async function getAllExamsFallbackSimple(): Promise<ClinicalResultListItem[]> {
  const items: ClinicalResultListItem[] = [];
  let page = 1;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const { data } = await api.get<ExamsListSimpleResponse>('/client/exams-list-simple', {
        params: {
          page,
          per_page: 100,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });

      const batch = (data?.data ?? []).map(normalizeExamRow);
      items.push(...batch);

      const currentPage = Number(data?.meta?.current_page ?? page);
      const lastPage = Number(data?.meta?.last_page ?? page);
      hasNextPage = currentPage < lastPage;
      page += 1;
    }
  } catch {
    return [];
  }

  return items;
}
