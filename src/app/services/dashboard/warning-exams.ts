import { api } from '..';

type WarningResponse = {
  warning_exams: Array<ExamsResponse>;
};

type ExamsResponse = {
  id: number;
  user_id: number;
  branch_id: number;
  client_id: number;
  patient_id: number;
  clinical_type_result_id: number;
  department_id: number;
  position_id: number;
  aso_number: number;
  aso_date: Date;
  work_at_height: boolean;
  confined_space: boolean;
  sequential_audiometry: boolean;
  observation: string;
  status: number;
  public: boolean;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
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
    created_at: Date | null;
    updated_at: Date | null;
  };
};

export async function warningExams(): Promise<Array<ExamsResponse>> {
  const { signal } = new AbortController();

  const { data } = await api.get<WarningResponse>(`/client/warning-exams`, {
    signal,
  });

  return data.warning_exams;
}
