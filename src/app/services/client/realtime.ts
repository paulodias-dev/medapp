import { LaudoRealtimeFeedResponse } from '@/app/models';

import { api } from '..';

type GetLaudosRealtimeParams = {
  since?: string;
  limit?: number;
};

export async function getLaudosRealtime(
  params?: GetLaudosRealtimeParams
): Promise<LaudoRealtimeFeedResponse> {
  const { data } = await api.get<LaudoRealtimeFeedResponse>('/client/realtime/laudos', {
    params,
  });

  return data;
}
