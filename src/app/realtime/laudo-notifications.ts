import { localStorageKeys } from '@/app/config/local-storage-keys';
import { LaudoRealtimePayload } from '@/app/models';

const MAX_NOTIFICATIONS = 200;
export const LAUDO_NOTIFICATIONS_UPDATED_EVENT = 'medapp:laudo-notifications-updated';

export type LaudoNotificationItem = {
  id: string;
  tenant_id: number;
  clinical_result_id: number;
  aso_number: number | string | null;
  status: number;
  public: boolean;
  patient_name: string | null;
  clinical_type_name: string | null;
  message: string;
  event_at: string;
  read: boolean;
  read_at: string | null;
};

function getStorageKey(tenantId: number): string {
  return `${localStorageKeys.LAUDO_NOTIFICATIONS_PREFIX}:${tenantId}`;
}

function compareByEventDateDesc(a: LaudoNotificationItem, b: LaudoNotificationItem): number {
  const aTime = Date.parse(a.event_at);
  const bTime = Date.parse(b.event_at);

  if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
  if (Number.isNaN(aTime)) return 1;
  if (Number.isNaN(bTime)) return -1;

  return bTime - aTime;
}

function normalizePayload(payload: LaudoRealtimePayload): LaudoNotificationItem {
  const eventAt = payload.event_at ?? new Date().toISOString();

  return {
    id: `${payload.clinical_result_id}:${eventAt}`,
    tenant_id: Number(payload.tenant_id ?? 0),
    clinical_result_id: Number(payload.clinical_result_id ?? 0),
    aso_number: payload.aso_number ?? null,
    status: Number(payload.status ?? 0),
    public: Boolean(payload.public),
    patient_name: payload.patient?.name ?? null,
    clinical_type_name: payload.clinical_type_result?.name ?? null,
    message: payload.message ?? 'Novo laudo disponível para visualização.',
    event_at: eventAt,
    read: false,
    read_at: null,
  };
}

export function getLaudoNotifications(tenantId: number): LaudoNotificationItem[] {
  if (!Number.isFinite(tenantId) || tenantId <= 0) {
    return [];
  }

  const storageKey = getStorageKey(tenantId);

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as LaudoNotificationItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed.sort(compareByEventDateDesc);
  } catch {
    return [];
  }
}

function persistLaudoNotifications(tenantId: number, notifications: LaudoNotificationItem[]): void {
  if (!Number.isFinite(tenantId) || tenantId <= 0) return;

  const storageKey = getStorageKey(tenantId);
  localStorage.setItem(storageKey, JSON.stringify(notifications));
  dispatchNotificationsUpdatedEvent(tenantId, notifications);
}

function dispatchNotificationsUpdatedEvent(
  tenantId: number,
  notifications: LaudoNotificationItem[],
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  window.dispatchEvent(
    new CustomEvent(LAUDO_NOTIFICATIONS_UPDATED_EVENT, {
      detail: {
        tenantId,
        unreadCount,
      },
    }),
  );
}

export function upsertLaudoNotifications(
  tenantId: number,
  payloads: LaudoRealtimePayload[],
): LaudoNotificationItem[] {
  if (!Array.isArray(payloads) || payloads.length === 0) {
    return getLaudoNotifications(tenantId);
  }

  const existingItems = getLaudoNotifications(tenantId);
  const map = new Map(existingItems.map((item) => [item.id, item]));

  payloads.forEach((payload) => {
    const normalized = normalizePayload(payload);

    if (normalized.clinical_result_id <= 0) {
      return;
    }

    const existing = map.get(normalized.id);
    map.set(normalized.id, {
      ...normalized,
      read: existing?.read ?? false,
      read_at: existing?.read_at ?? null,
    });
  });

  const merged = Array.from(map.values())
    .sort(compareByEventDateDesc)
    .slice(0, MAX_NOTIFICATIONS);

  persistLaudoNotifications(tenantId, merged);
  return merged;
}

export function markLaudoNotificationAsRead(tenantId: number, id: string): LaudoNotificationItem[] {
  const notifications = getLaudoNotifications(tenantId);
  const updated = notifications.map((notification) => {
    if (notification.id !== id) {
      return notification;
    }

    if (notification.read) {
      return notification;
    }

    return {
      ...notification,
      read: true,
      read_at: new Date().toISOString(),
    };
  });

  persistLaudoNotifications(tenantId, updated);
  return updated;
}

export function markAllLaudoNotificationsAsRead(tenantId: number): LaudoNotificationItem[] {
  const nowIso = new Date().toISOString();
  const notifications = getLaudoNotifications(tenantId);

  const updated = notifications.map((notification) => ({
    ...notification,
    read: true,
    read_at: notification.read_at ?? nowIso,
  }));

  persistLaudoNotifications(tenantId, updated);
  return updated;
}

export function getUnreadLaudoNotificationsCount(tenantId: number): number {
  return getLaudoNotifications(tenantId).filter((notification) => !notification.read).length;
}
