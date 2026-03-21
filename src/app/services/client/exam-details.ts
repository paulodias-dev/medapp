import { ClinicalResultDetailResponse } from '@/app/models';
import { api } from '..';

const API_ORIGIN = 'https://ssma-gestor.fluxosistemas.com.br';

function resolveAbsoluteUrl(data: unknown): string {
  if (typeof data !== 'string' || !data) {
    return '';
  }

  return new URL(data, API_ORIGIN).toString();
}

type ApiExamDetailFile = {
  id: number;
  name: string;
  description?: string | null;
  type: string;
  path: string;
  size?: number | null;
  created_at: string;
  updated_at: string;
};

type ApiExamDetailExamItem = {
  id: number;
  clinical_result_id: number;
  exam_id: number;
  warning?: boolean;
  public?: boolean;
  comment?: string | null;
  exams?: Array<{ id: number; name: string }>;
  files?: ApiExamDetailFile[];
};

type ApiExamDetailPayload = {
  id: number;
  aso_number: number | null;
  aso_date: string | null;
  status: number;
  public: boolean;
  created_at: string;
  updated_at: string;
  patient?: {
    id: number;
    name: string;
    cpf?: string;
    phone1?: string | null;
    email?: string | null;
  };
  clinical_type_result?: {
    id: number;
    name: string;
  };
  clinicalTypeResult?: {
    id: number;
    name: string;
  };
  clinical_result_exams?: ApiExamDetailExamItem[];
  clinicalResultExams?: ApiExamDetailExamItem[];
  with_files_count?: number;
  without_files_count?: number;
  withFilesCount?: number;
  withoutFilesCount?: number;
  timeline?: Array<{
    key?: string;
    title?: string;
    description?: string;
    event_at?: string;
    type?: string;
    status?: number;
    public?: boolean;
  }>;
};

function normalizeExamDetailResponse(
  payload: ApiExamDetailPayload,
): ClinicalResultDetailResponse['data'] {
  const clinicalResultExamsSource =
    payload.clinicalResultExams ?? payload.clinical_result_exams ?? [];

  const clinicalResultExams = clinicalResultExamsSource.map((item) => ({
    id: item.id,
    clinical_result_id: item.clinical_result_id,
    exam_id: item.exam_id,
    warning: Boolean(item.warning),
    public: Boolean(item.public),
    comment: item.comment ?? null,
    exams: item.exams ?? [],
    files: (item.files ?? []).map((file) => ({
      id: file.id,
      name: file.name,
      description: file.description ?? null,
      type: file.type,
      path: file.path,
      size: file.size ?? null,
      created_at: file.created_at,
      updated_at: file.updated_at,
    })),
  }));

  return {
    id: payload.id,
    aso_number: payload.aso_number ?? null,
    aso_date: payload.aso_date ?? null,
    status: payload.status,
    public: Boolean(payload.public),
    created_at: payload.created_at,
    updated_at: payload.updated_at,
    patient: {
      id: payload.patient?.id ?? 0,
      name: payload.patient?.name ?? '-',
      cpf: payload.patient?.cpf,
      phone1: payload.patient?.phone1 ?? null,
      email: payload.patient?.email ?? null,
    },
    clinicalTypeResult: payload.clinicalTypeResult ?? payload.clinical_type_result,
    clinicalResultExams,
    timeline: (payload.timeline ?? []).map((item) => ({
      key: item.key ?? 'timeline-event',
      title: item.title ?? 'Atualização',
      description: item.description ?? '',
      event_at: item.event_at ?? '',
      type: item.type ?? 'info',
      status: item.status,
      public: item.public,
    })),
    withFilesCount:
      payload.withFilesCount ??
      payload.with_files_count ??
      clinicalResultExams.filter((exam) => exam.files.length > 0).length,
    withoutFilesCount:
      payload.withoutFilesCount ??
      payload.without_files_count ??
      clinicalResultExams.filter((exam) => exam.files.length === 0).length,
  };
}

export async function getExamById(
  id: number | string,
): Promise<ClinicalResultDetailResponse> {
  const { signal } = new AbortController();

  const { data } = await api.get<ClinicalResultDetailResponse & { data: ApiExamDetailPayload }>(
    `/client/exam/${id}`,
    {
    signal,
  },
  );

  return {
    success: Boolean(data?.success),
    data: normalizeExamDetailResponse(data.data),
  };
}

export async function getExamFileViewerUrl(
  fileId: number | string,
): Promise<string> {
  const { signal } = new AbortController();

  const { data } = await api.get<string>(`/client/fileViwerById/${fileId}`, {
    signal,
  });

  return resolveAbsoluteUrl(data);
}

export async function getExamFileDownloadUrl(
  fileId: number | string,
): Promise<string> {
  const { signal } = new AbortController();

  const { data } = await api.get<string>(`/client/fileDownloadById/${fileId}`, {
    signal,
  });

  return resolveAbsoluteUrl(data);
}

export async function getExamPdfBlob(id: number | string): Promise<Blob> {
  const { signal } = new AbortController();

  const { data } = await api.get<Blob>(`/client/print-pdf/${id}`, {
    signal,
    responseType: 'blob',
  });

  return data;
}
