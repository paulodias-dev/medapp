import { api } from '..';

export type AppointmentRequestMode = 'scheduled' | 'unscheduled';

export type AppointmentSettingsResponse = {
  branch_id: number;
  request_mode: AppointmentRequestMode;
  allows_scheduling: boolean;
};

export async function getAppointmentSettings(): Promise<AppointmentSettingsResponse> {
  const { data } = await api.get<AppointmentSettingsResponse>('client/appointment-settings');
  return data;
}

