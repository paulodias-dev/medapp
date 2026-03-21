import { ClinicalResultDetailResponse } from '@/app/models';
import { api } from '..';

const API_ORIGIN = 'https://ssma-gestor.fluxosistemas.com.br';

function resolveAbsoluteUrl(data: unknown): string {
  if (typeof data !== 'string' || !data) {
    return '';
  }

  return new URL(data, API_ORIGIN).toString();
}

export async function getExamById(
  id: number | string,
): Promise<ClinicalResultDetailResponse> {
  const { signal } = new AbortController();

  const { data } = await api.get<ClinicalResultDetailResponse>(`/client/exam/${id}`, {
    signal,
  });

  return data;
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
