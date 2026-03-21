import { clientService } from '@/app/services/client';
import { Badge } from '@/views/components/ui/badge';
import { Button } from '@/views/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/views/components/ui/dialog';
import { Textarea } from '@/views/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarBlank, FilePdf, SpinnerGap, User } from '@phosphor-icons/react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';

type StatusMeta = {
  label: string;
  variant: 'default' | 'secondary' | 'outline';
};

function getTimelineTypeClass(type?: string): string {
  if (type === 'success') return 'bg-emerald-500';
  if (type === 'warning') return 'bg-amber-500';
  if (type === 'danger') return 'bg-red-500';
  return 'bg-blue-500';
}

function getStatusMeta(status: number): StatusMeta {
  if (status === 1) {
    return { label: 'Aprovado', variant: 'secondary' };
  }

  if (status === 0) {
    return { label: 'Pendente', variant: 'outline' };
  }

  if (status === 2) {
    return { label: 'Cancelado', variant: 'default' };
  }

  return { label: 'Reprovado', variant: 'default' };
}

function formatDate(value?: string | null, withTime = false): string {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(parsed);
}

export function CertificateShow() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const location = useLocation();
  const [openingPdf, setOpeningPdf] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const examId = Number(id);
  const isValidExamId = Number.isFinite(examId) && examId > 0;

  const query = useQuery({
    queryKey: ['exam-details-page', examId],
    queryFn: () => clientService.getExamById(examId),
    enabled: isValidExamId,
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });

  const details = query.data?.data;
  const statusMeta = getStatusMeta(Number(details?.status ?? 0));
  const fromSubmission = Boolean((location.state as { fromSubmission?: boolean } | null)?.fromSubmission);

  const cancelMutation = useMutation({
    mutationFn: () => clientService.cancelExamRequest(examId, cancelReason),
    onSuccess: (response) => {
      toast.success(response.message || 'Solicitação cancelada com sucesso.');
      setCancelDialogOpen(false);
      setCancelReason('');
      void query.refetch();
      void queryClient.invalidateQueries({ queryKey: ['getAllExams'] });
      void queryClient.invalidateQueries({ queryKey: ['sumaryExams'] });
      void queryClient.invalidateQueries({ queryKey: ['warningExams'] });
      void queryClient.invalidateQueries({ queryKey: ['laudo-notifications-feed'] });
    },
    onError: () => {
      toast.error('Não foi possível cancelar a solicitação.');
    },
  });

  async function handleOpenPdf() {
    if (!isValidExamId) return;

    try {
      setOpeningPdf(true);
      const blob = await clientService.getExamPdfBlob(examId);
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 60_000);
    } catch {
      toast.error('Não foi possível abrir o PDF da ficha de encaminhamento.');
    } finally {
      setOpeningPdf(false);
    }
  }

  if (!isValidExamId) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-700">ID de atestado inválido.</p>
          <Button asChild variant="outline" className="mt-4 rounded-xl">
            <Link to="/certificates">Voltar para atestados</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            {fromSubmission && (
              <div className="inline-flex items-center rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Solicitação cadastrada com sucesso
              </div>
            )}
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Detalhes do atestado
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Confira os dados e visualize a ficha de encaminhamento em PDF.
            </p>
          </div>

          <div className="flex w-full md:w-auto flex-col sm:flex-row gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/certificates">
                <ArrowLeft className="w-4 h-4" />
                Voltar para listagem
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/certificate">
                Solicitar novo
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <section className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6">
          {query.isLoading ? (
            <div className="flex items-center justify-center py-10">
              <SpinnerGap className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : query.isError || !details ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-semibold text-red-700">
                Não foi possível carregar os dados do atestado.
              </p>
              <Button variant="outline" className="mt-4 rounded-xl" onClick={() => query.refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-slate-50 p-4 space-y-1">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">ID do Registro</p>
                  <p className="text-lg font-black text-slate-900">#{details.aso_number ?? details.id}</p>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-4 space-y-1">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Status</p>
                  <Badge variant={statusMeta.variant} className="rounded-full px-3 w-fit">
                    {statusMeta.label}
                  </Badge>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-4 space-y-1">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Colaborador</p>
                  <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <User size={16} />
                    {details.patient?.name || '-'}
                  </p>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-4 space-y-1">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Tipo de exame</p>
                  <p className="text-base font-semibold text-slate-900">
                    {details.clinicalTypeResult?.name || '-'}
                  </p>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-4 space-y-1">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Data do ASO</p>
                  <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <CalendarBlank size={16} />
                    {formatDate(details.aso_date)}
                  </p>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-4 space-y-1">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Atualizado em</p>
                  <p className="text-base font-semibold text-slate-900">{formatDate(details.updated_at, true)}</p>
                </div>
              </div>

                <div className="rounded-2xl border bg-white p-4 sm:p-5">
                  <h2 className="text-base font-black text-slate-900">Timeline da solicitação</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Histórico dos eventos principais deste pedido.
                  </p>

                  <div className="mt-4 space-y-4">
                    {(details.timeline ?? []).map((event) => (
                      <div key={`${event.key}-${event.event_at}`} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className={`h-2.5 w-2.5 rounded-full ${getTimelineTypeClass(event.type)}`} />
                          <span className="mt-1 h-full w-px bg-slate-200" />
                        </div>

                        <div className="pb-3">
                          <p className="text-sm font-bold text-slate-900">{event.title}</p>
                          <p className="text-xs text-slate-500">{event.description}</p>
                          <p className="text-xs text-slate-400 mt-1">{formatDate(event.event_at, true)}</p>
                        </div>
                      </div>
                    ))}

                    {(!details.timeline || details.timeline.length === 0) && (
                      <p className="text-sm text-slate-500">Nenhum evento disponível para esta solicitação.</p>
                    )}
                  </div>
                </div>
              </div>

              <aside className="rounded-2xl border border-blue-100 bg-blue-50 p-5 h-fit space-y-3">
                <p className="font-black text-slate-900">Ficha de encaminhamento</p>
                <p className="text-sm text-slate-600">
                  Visualize o PDF com os dados da solicitação e orientações do atendimento.
                </p>

                <Button
                  type="button"
                  className="w-full rounded-xl gap-2"
                  onClick={handleOpenPdf}
                  disabled={openingPdf}>
                  {openingPdf ? (
                    <SpinnerGap className="h-4 w-4 animate-spin" />
                  ) : (
                    <FilePdf className="h-4 w-4" />
                  )}
                  Visualizar PDF
                </Button>

                {Number(details.status) === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setCancelDialogOpen(true)}>
                    Cancelar solicitação
                  </Button>
                )}
              </aside>
            </div>
          )}
        </section>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="z-[999999] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cancelar solicitação</DialogTitle>
            <DialogDescription>
              Esta ação altera o status do pedido para cancelado. Você pode informar o motivo abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Motivo (opcional)
            </p>
            <Textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Ex.: colaborador indisponível para comparecimento."
              className="min-h-[120px] rounded-xl"
              maxLength={500}
            />
            <p className="text-xs text-slate-400">{cancelReason.length}/500</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelMutation.isPending}>
              Voltar
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-red-600 hover:bg-red-700"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? (
                <>
                  <SpinnerGap className="h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Confirmar cancelamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
