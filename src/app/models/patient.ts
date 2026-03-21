export type ClientPatientListItem = {
  id: number;
  name: string;
  cpf: string | null;
  email: string | null;
  phone1: string | null;
  active: boolean | number;
  created_at: string;
  updated_at: string;
};

export type ClientPatientsListResponse = {
  patients: ClientPatientListItem[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
