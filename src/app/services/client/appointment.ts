import { api } from '..';

export async function getSchedules(date?: string) {
  const { data } = await api.get('client/get-schedules', {
    params: { date },
  });
  return data.available_schedules;
}

export async function storeExam(payload: any) {
  const { data } = await api.post('client/exam-store', payload);
  return data;
}
