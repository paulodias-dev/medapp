export type ClinicalResultStatus = 0 | 1 | number;

export type ClinicalResultListItem = {
  id: number;
  aso_number: number | null;
  aso_date: string | null;
  status: ClinicalResultStatus;
  public: boolean;
  created_at: string;
  updated_at: string;
  patient?: {
    id: number;
    name: string;
    phone1: string | null;
    email: string | null;
  };
  clinical_type_result?: {
    id: number;
    name: string;
  };
};

export type ClinicalResultExamFile = {
  id: number;
  name: string;
  description: string | null;
  type: string;
  path: string;
  size: number | null;
  created_at: string;
  updated_at: string;
};

export type ClinicalResultExamItem = {
  id: number;
  clinical_result_id: number;
  exam_id: number;
  warning: boolean;
  public: boolean;
  comment: string | null;
  exams: Array<{
    id: number;
    name: string;
  }>;
  files: ClinicalResultExamFile[];
};

export type ClinicalResultTimelineItem = {
  key: string;
  title: string;
  description: string;
  event_at: string;
  type: 'info' | 'warning' | 'success' | 'danger' | string;
  status?: number;
  public?: boolean;
};

export type ClinicalResultDetail = {
  id: number;
  aso_number: number | null;
  aso_date: string | null;
  comment?: string | null;
  observation?: string | null;
  status: ClinicalResultStatus;
  public: boolean;
  created_at: string;
  updated_at: string;
  patient: {
    id: number;
    name: string;
    cpf?: string;
    phone1?: string | null;
    email?: string | null;
  };
  clinicalTypeResult?: {
    id: number;
    name: string;
  };
  clinicalResultExams: ClinicalResultExamItem[];
  timeline?: ClinicalResultTimelineItem[];
  withFilesCount?: number;
  withoutFilesCount?: number;
};

export type ClinicalResultDetailResponse = {
  success: boolean;
  data: ClinicalResultDetail;
};
