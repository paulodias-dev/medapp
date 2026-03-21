import { localStorageKeys } from '@/app/config/local-storage-keys';
import { useAuth } from '@/app/context/use-auth';
import { LaudoRealtimePayload } from '@/app/models';
import { clientService } from '@/app/services/client';
import { getStoredActiveTenantId } from '@/app/utils/auth-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { upsertLaudoNotifications } from './laudo-notifications';

import { getEchoInstance } from './echo';

export type LaudoProntoPayload = LaudoRealtimePayload;

type UseLaudoRealtimeOptions = {
  enabled?: boolean;
  pollingIntervalMs?: number;
  showToast?: boolean;
  onLaudoPronto?: (payload: LaudoProntoPayload) => void;
};

const DEFAULT_POLLING_INTERVAL_MS = 45_000;
const QUERY_KEYS_TO_INVALIDATE = [['getAllExams'], ['warningExams'], ['sumaryExams']] as const;

function buildLastEventStorageKey(tenantId: number): string {
  return `${localStorageKeys.LAST_LAUDO_EVENT_AT_PREFIX}:${tenantId}`;
}

function getOrInitializeSince(storageKey: string): string {
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }

  const nowIso = new Date().toISOString();
  localStorage.setItem(storageKey, nowIso);
  return nowIso;
}

function persistLastEventAt(storageKey: string, eventAt?: string | null): void {
  if (!eventAt) {
    return;
  }

  localStorage.setItem(storageKey, eventAt);
}

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
      getStoredActiveTenantId() ?? String(user?.id ?? '');
    const tenantId = Number(activeTenantRaw);

    if (!Number.isFinite(tenantId) || tenantId <= 0) {
      return;
    }

    const lastEventStorageKey = buildLastEventStorageKey(tenantId);
    getOrInitializeSince(lastEventStorageKey);

    const invalidateRelatedQueries = () => {
      QUERY_KEYS_TO_INVALIDATE.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey: [...queryKey] });
      });
    };

    let pollingTimer: ReturnType<typeof setInterval> | null = null;
    let isPollingInFlight = false;

    const emitPollingToast = (payloads: LaudoProntoPayload[]) => {
      if (!showToast || payloads.length === 0) {
        return;
      }

      if (payloads.length === 1) {
        const payload = payloads[0];
        const aso = payload.aso_number ? `ASO #${payload.aso_number}` : 'novo ASO';
        const patientName = payload.patient?.name ? ` - ${payload.patient.name}` : '';
        toast.success('Laudo disponível', {
          description: `${aso}${patientName}`,
        });
        return;
      }

      toast.success('Novos laudos disponíveis', {
        description: `${payloads.length} laudos foram atualizados.`,
      });
    };

    const runPollingCycle = async () => {
      if (isPollingInFlight) {
        return;
      }

      isPollingInFlight = true;

      try {
        const since = getOrInitializeSince(lastEventStorageKey);
        const feed = await clientService.realtime.getLaudosRealtime({
          since,
          limit: 30,
        });

        const payloads = feed.data ?? [];
        const lastEventAt =
          feed.meta?.last_event_at ??
          payloads[payloads.length - 1]?.event_at ??
          null;

        if (payloads.length > 0) {
          upsertLaudoNotifications(tenantId, payloads);
          invalidateRelatedQueries();
          emitPollingToast(payloads);
          payloads.forEach((payload) => onLaudoPronto?.(payload));
        }

        persistLastEventAt(lastEventStorageKey, lastEventAt);
      } catch {
        // polling errors are ignored to avoid UI noise in temporary network failures
      } finally {
        isPollingInFlight = false;
      }
    };

    const startPolling = () => {
      if (pollingTimer) {
        return;
      }

      void runPollingCycle();

      pollingTimer = setInterval(() => {
        void runPollingCycle();
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
      upsertLaudoNotifications(tenantId, [payload]);
      invalidateRelatedQueries();
      persistLastEventAt(lastEventStorageKey, payload.event_at ?? new Date().toISOString());

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
