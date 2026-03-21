import { localStorageKeys } from '@/app/config/local-storage-keys';
import { useAuth } from '@/app/context/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { getEchoInstance } from './echo';

export type LaudoProntoPayload = {
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

type UseLaudoRealtimeOptions = {
  enabled?: boolean;
  pollingIntervalMs?: number;
  showToast?: boolean;
  onLaudoPronto?: (payload: LaudoProntoPayload) => void;
};

const DEFAULT_POLLING_INTERVAL_MS = 45_000;
const QUERY_KEYS_TO_INVALIDATE = [['getAllExams'], ['warningExams'], ['sumaryExams']] as const;

export function useLaudoRealtime(options: UseLaudoRealtimeOptions = {}): void {
  const {
    enabled = true,
    pollingIntervalMs = DEFAULT_POLLING_INTERVAL_MS,
    showToast = true,
    onLaudoPronto,
  } = options;

  const queryClient = useQueryClient();
  const { isAuth, user } = useAuth();

  useEffect(() => {
    if (!enabled || !isAuth) {
      return;
    }

    const activeTenantRaw =
      localStorage.getItem(localStorageKeys.ACTIVE_TENANT_ID) ?? String(user?.id ?? '');
    const tenantId = Number(activeTenantRaw);

    if (!Number.isFinite(tenantId) || tenantId <= 0) {
      return;
    }

    const invalidateRelatedQueries = () => {
      QUERY_KEYS_TO_INVALIDATE.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey: [...queryKey] });
      });
    };

    let pollingTimer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (pollingTimer) {
        return;
      }

      pollingTimer = setInterval(() => {
        invalidateRelatedQueries();
      }, pollingIntervalMs);
    };

    const stopPolling = () => {
      if (!pollingTimer) {
        return;
      }

      clearInterval(pollingTimer);
      pollingTimer = null;
    };

    const echo = getEchoInstance();
    if (!echo) {
      startPolling();
      return () => {
        stopPolling();
      };
    }

    const channelName = `tenant.${tenantId}`;
    const channel = echo.private(channelName);

    const onLaudo = (payload: LaudoProntoPayload) => {
      invalidateRelatedQueries();

      if (showToast) {
        const aso = payload.aso_number ? `ASO #${payload.aso_number}` : 'novo ASO';
        const patientName = payload.patient?.name ? ` - ${payload.patient.name}` : '';
        toast.success('Laudo disponível', {
          description: `${aso}${patientName}`,
        });
      }

      onLaudoPronto?.(payload);
    };

    channel.listen('.LaudoPronto', onLaudo);

    const pusherConnection = (echo as any)?.connector?.pusher?.connection;

    const handleConnectionState = (states: { current: string }) => {
      if (!states?.current) {
        return;
      }

      if (states.current === 'connected') {
        stopPolling();
        return;
      }

      if (
        states.current === 'disconnected' ||
        states.current === 'unavailable' ||
        states.current === 'failed'
      ) {
        startPolling();
      }
    };

    const handleConnectionError = () => {
      startPolling();
    };

    pusherConnection?.bind('state_change', handleConnectionState);
    pusherConnection?.bind('error', handleConnectionError);

    return () => {
      channel.stopListening('.LaudoPronto');
      echo.leave(channelName);
      pusherConnection?.unbind('state_change', handleConnectionState);
      pusherConnection?.unbind('error', handleConnectionError);
      stopPolling();
    };
  }, [enabled, isAuth, onLaudoPronto, pollingIntervalMs, queryClient, showToast, user?.id]);
}
