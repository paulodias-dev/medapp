import { useAuth } from '@/app/context/use-auth';
import { clientService } from '@/app/services/client';
import {
  LaudoNotificationItem,
  getLaudoNotifications,
  markAllLaudoNotificationsAsRead,
  markLaudoNotificationAsRead,
  upsertLaudoNotifications,
} from '@/app/realtime';
import { getStoredActiveTenantId } from '@/app/utils/auth-storage';
import { Badge } from '@/views/components/ui/badge';
import { Button } from '@/views/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Bell, FilePdf, SpinnerGap } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

function formatDateLabel(value?: string | null): string {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
}

function getStatusMeta(status: number) {
  if (status === 1) {
    return { label: 'Aprovado', variant: 'secondary' as const };
  }

  if (status === 0) {
    return { label: 'Pendente', variant: 'outline' as const };
  }

  if (status === 2) {
    return { label: 'Cancelado', variant: 'default' as const };
  }

  return { label: 'Reprovado', variant: 'default' as const };
}

function getTenantId(authUserId?: number): number {
  const activeTenant = Number(getStoredActiveTenantId() ?? authUserId ?? 0);
  if (!Number.isFinite(activeTenant) || activeTenant <= 0) {
    return 0;
  }

  return activeTenant;
}

export function News() {
  const { user } = useAuth();
  const [openingPdfId, setOpeningPdfId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<LaudoNotificationItem[]>([]);

  const tenantId = useMemo(() => getTenantId(user?.id), [user?.id]);

  const feedQuery = useQuery({
    queryKey: ['laudo-notifications-feed', tenantId],
    enabled: tenantId > 0,
    retry: 1,
    refetchInterval: 60_000,
    queryFn: () =>
      clientService.realtime.getLaudosRealtime({
        since: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
        limit: 100,
      }),
  });

  useEffect(() => {
    if (tenantId <= 0) return;
    setNotifications(getLaudoNotifications(tenantId));
  }, [tenantId]);

  useEffect(() => {
    if (tenantId <= 0 || !feedQuery.data?.data) return;

    const merged = upsertLaudoNotifications(tenantId, feedQuery.data.data);
    setNotifications(merged);
  }, [feedQuery.data, tenantId]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    if (tenantId <= 0) return;
    const updated = markLaudoNotificationAsRead(tenantId, notificationId);
    setNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    if (tenantId <= 0) return;
    const updated = markAllLaudoNotificationsAsRead(tenantId);
    setNotifications(updated);
  };

  const handleOpenPdf = async (notification: LaudoNotificationItem) => {
    try {
      setOpeningPdfId(notification.clinical_result_id);
      const blob = await clientService.getExamPdfBlob(notification.clinical_result_id);
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 60_000);

      handleMarkAsRead(notification.id);
    } catch {
      toast.error('Não foi possível abrir o PDF do atestado.');
    } finally {
      setOpeningPdfId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Notificações e alertas
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Acompanhe notificações de laudos e mudanças de status dos atestados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={unreadCount > 0 ? 'default' : 'outline'} className="rounded-full px-3 py-1">
              {unreadCount} não lidas
            </Badge>
            <Button type="button" variant="outline" className="rounded-xl" onClick={handleMarkAllAsRead}>
              Marcar todas como lidas
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <section className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          {feedQuery.isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-14">
              <SpinnerGap className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedQuery.isError && notifications.length === 0 ? (
            <div className="px-6 py-12 text-center space-y-3">
              <p className="text-sm text-red-500">
                Não foi possível carregar as notificações.
              </p>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => feedQuery.refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <Bell size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-700">Nenhuma notificação no momento.</p>
              <p className="text-xs text-slate-500">Quando novos laudos estiverem disponíveis, eles aparecerão aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const statusMeta = getStatusMeta(notification.status);

                return (
                  <article
                    key={notification.id}
                    className={`px-4 sm:px-6 py-4 transition-colors ${
                      notification.read ? 'bg-white' : 'bg-blue-50/40'
                    }`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={statusMeta.variant} className="rounded-full px-3">
                            {statusMeta.label}
                          </Badge>
                          {!notification.read && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                              Nova
                            </span>
                          )}
                        </div>

                        <h2 className="text-base font-bold text-slate-900">
                          {notification.aso_number ? `ASO #${notification.aso_number}` : 'Novo atestado'}
                        </h2>

                        <p className="text-sm text-slate-600">
                          {notification.patient_name ?? 'Colaborador não identificado'} •{' '}
                          {notification.clinical_type_name ?? 'Tipo não informado'}
                        </p>

                        <p className="text-sm text-slate-500">{notification.message}</p>

                        <p className="text-xs text-slate-400">
                          Evento em {formatDateLabel(notification.event_at)}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => handleMarkAsRead(notification.id)}>
                          <Link to={`/certificates/${notification.clinical_result_id}`}>
                            Ver atestado
                          </Link>
                        </Button>

                        <Button
                          type="button"
                          className="rounded-xl gap-2"
                          disabled={openingPdfId === notification.clinical_result_id}
                          onClick={() => handleOpenPdf(notification)}>
                          {openingPdfId === notification.clinical_result_id ? (
                            <SpinnerGap className="h-4 w-4 animate-spin" />
                          ) : (
                            <FilePdf className="h-4 w-4" />
                          )}
                          Visualizar PDF
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
