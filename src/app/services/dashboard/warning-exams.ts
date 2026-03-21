import { api } from '..';

type WarningResponse = {
  warning_exams: Array<WarningExamResponse>;
  meta?: {
    reference_date: string;
    expiration_cutoff: string;
    total_expired: number;
  };
};

export type WarningExamResponse = {
  id: number;
  user_id: number;
  branch_id: number;
  client_id: number;
  patient_id: number;
  clinical_type_result_id: number;
  department_id: number;
  position_id: number;
  aso_number: number;
  aso_date: string | null;
  work_at_height: boolean;
  confined_space: boolean;
  sequential_audiometry: boolean;
  observation: string;
  status: number;
  public: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  is_expired?: boolean;
  expires_at?: string | null;
  days_overdue?: number;
  patient: {
    id: number;
    name: string;
    phone1: string;
    email: string;
  };
  clinical_type_result: {
    id: number;
    name: string;
    active: number;
    created_at: string | null;
    updated_at: string | null;
  };
};

export async function warningExams(): Promise<Array<WarningExamResponse>> {
  const { signal } = new AbortController();

  const { data } = await api.get<WarningResponse>(`/client/warning-exams`, {
    signal,
  });

  return data.warning_exams;
}
