import { api } from '..';

export type ManagerStat = {
  name: string;
  value: string;
  trend: string;
  color: string;
  icon: string;
};

export type RecentActivity = {
  id: number;
  title: string;
  subtitle: string;
  time: string;
};

export type ManagerSummaryResponse = {
  stats: ManagerStat[];
  recent_activity: RecentActivity[];
};

export async function getSummary(): Promise<ManagerSummaryResponse> {
  const { data } = await api.get('/manager/summary');
  return data;
}
