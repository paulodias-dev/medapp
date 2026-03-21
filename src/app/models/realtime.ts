export type LaudoRealtimePayload = {
  tenant_id: number;
  branch_id: number;
  clinical_result_id: number;
  aso_number: number | string | null;
  status: number;
  public: boolean;
  patient?: {
    name?: string | null;
  };
  clinical_type_result?: {
    name?: string | null;
  };
  links?: {
    exam_details?: string;
  };
  message?: string;
  event_at?: string;
};

export type LaudoRealtimeFeedResponse = {
  data: LaudoRealtimePayload[];
  meta: {
    count: number;
    last_event_at: string | null;
  };
};
