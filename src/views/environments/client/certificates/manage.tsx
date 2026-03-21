import {
  ClinicalResultExamFile,
  ClinicalResultListItem,
} from '@/app/models';
import { clientService } from '@/app/services/client';
import { Badge } from '@/views/components/ui/badge';
import { Button } from '@/views/components/ui/button';
import { ScrollArea } from '@/views/components/ui/scroll-area';
import { Skeleton } from '@/views/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/views/components/ui/sheet';
import { Separator } from '@/views/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/views/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  DownloadSimple,
  Eye, 
  File, 
  FilePdf, 
  Image as ImageIcon,
  SpinnerGap, 
  User, 
  IdentificationCard,
  Phone,
  Envelope,
  Calendar,
  Clock,
  Info
} from '@phosphor-icons/react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

type ManageProps = {
  exam: ClinicalResultListItem;
};

type FileWithContext = ClinicalResultExamFile & {
  examName: string;
};

export function Manage({ exam }: ManageProps) {
  const [open, setOpen] = useState(false);
  const [openingFileId, setOpeningFileId] = useState<number | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);
  const [openingPdf, setOpeningPdf] = useState(false);

  const detailQuery = useQuery({
    queryKey: ['exam-details', exam.id],
    queryFn: () => clientService.getExamById(exam.id),
    enabled: open,
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  const details = detailQuery.data?.data;
  const status = Number(details?.status ?? exam.status);
  const statusMeta = getStatusMeta(status);

  const patientName = details?.patient?.name ?? exam.patient?.name ?? '-';
  const patientPhone = details?.patient?.phone1 ?? exam.patient?.phone1 ?? '-';
  const patientEmail = details?.patient?.email ?? exam.patient?.email ?? '-';
  const examType =
    details?.clinicalTypeResult?.name ?? exam.clinical_type_result?.name ?? '-';

  const files = useMemo<FileWithContext[]>(() => {
    if (!details?.clinicalResultExams?.length) return [];

    return details.clinicalResultExams.flatMap((clinicalExam) => {
      const examName = clinicalExam.exams?.[0]?.name ?? `Exame #${clinicalExam.exam_id}`;

      return (clinicalExam.files ?? []).map((file) => ({
        ...file,
        examName,
      }));
    });
  }, [details]);

  async function handleOpenFile(file: FileWithContext) {
    try {
      setOpeningFileId(file.id);
      const fileUrl = await clientService.getExamFileViewerUrl(file.id);

      if (!fileUrl) {
        toast.error('Não foi possível localizar o arquivo.');
        return;
      }

      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Falha ao abrir o arquivo.');
    } finally {
      setOpeningFileId(null);
    }
  }

  async function handleOpenPdf() {
    try {
      setOpeningPdf(true);
      const blob = await clientService.getExamPdfBlob(exam.id);
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 60_000);
    } catch {
      toast.error('Não foi possível gerar o PDF do ASO.');
    } finally {
      setOpeningPdf(false);
    }
  }

  async function handleDownloadFile(file: FileWithContext) {
    try {
      setDownloadingFileId(file.id);
      const fileUrl = await clientService.getExamFileDownloadUrl(file.id);

      if (!fileUrl) {
        toast.error('Não foi possível gerar o link de download.');
        return;
      }

      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Falha ao baixar o arquivo.');
    } finally {
      setDownloadingFileId(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye size={16} />
          Detalhes
        </Button>
      </SheetTrigger>

      <SheetContent className="!w-[640px] !max-w-[640px] z-[999999999] rounded-2xl flex flex-col gap-4 overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <span>ASO #{exam.aso_number ?? exam.id}</span>
            <Badge variant={statusMeta.variant} className="rounded-full px-3">
              {statusMeta.label}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            Informações detalhadas e arquivos anexados ao atestado.
          </SheetDescription>
        </SheetHeader>

        <div className="rounded-2xl border bg-slate-50/50 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoCard icon={<User size={18} className="text-blue-500" />} label="Paciente" value={patientName} />
            <InfoCard icon={<IdentificationCard size={18} className="text-purple-500" />} label="Tipo de Exame" value={examType} />
            <InfoCard icon={<Phone size={18} className="text-green-500" />} label="Telefone" value={patientPhone} />
            <InfoCard icon={<Calendar size={18} className="text-orange-500" />} label="Data do ASO" value={formatDateSimple(details?.aso_date ?? exam.aso_date)} />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-white border border-blue-100 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-blue-100 p-2 text-blue-600">
                <File size={20} weight="fill" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Documentação Completa</p>
                <p className="text-xs text-slate-500">
                  {details?.withFilesCount ?? 0} { (details?.withFilesCount ?? 0) === 1 ? 'anexo encontrado' : 'anexos encontrados' }
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="default"
              className="gap-2 shadow-md hover:shadow-lg transition-all"
              onClick={handleOpenPdf}
              disabled={openingPdf}>
              {openingPdf ? (
                <SpinnerGap className="h-4 w-4 animate-spin" />
              ) : (
                <FilePdf className="h-4 w-4" weight="bold" />
              )}
              Vizualizar ASO
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="files">Arquivos ({files.length})</TabsTrigger>
          </TabsList>

          <Separator className="my-4" />

          <TabsContent value="general" className="space-y-4 outline-none">
            {detailQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
              </div>
            ) : detailQuery.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm font-medium text-red-800">Não foi possível carregar os detalhes.</p>
                <Button variant="ghost" size="sm" className="mt-2 text-red-600 hover:bg-red-100" onClick={() => detailQuery.refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <InfoItem label="ID do Registro" value={String(exam.id)} icon={<Info size={14} />} />
                <InfoItem label="Número do ASO" value={String(exam.aso_number ?? exam.id)} icon={<IdentificationCard size={14} />} />
                <InfoItem label="E-mail" value={patientEmail} icon={<Envelope size={14} />} />
                <InfoItem label="Status" value={statusMeta.label} icon={<Clock size={14} />} />
                <InfoItem label="Visibilidade" value={exam.public ? 'Público' : 'Privado'} icon={<Eye size={14} />} />
                <InfoItem
                  label="Atualizado em"
                  value={formatDateLabel(details?.updated_at ?? exam.updated_at)}
                  icon={<Calendar size={14} />}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="outline-none">
            {detailQuery.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-2">
                {files.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed p-10 text-center space-y-2">
                    <div className="flex justify-center">
                      <File size={40} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Este ASO não possui arquivos anexados.</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="group rounded-2xl border bg-white px-4 py-4 flex items-center gap-4 relative hover:border-blue-300 hover:shadow-md transition-all duration-200">
                        <div className="rounded-xl bg-slate-100 p-2 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <FileIcon type={file.type} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate text-slate-900 group-hover:text-blue-700">
                            {file.name ?? `Arquivo #${file.id}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            {file.examName} • {formatFileSize(file.size)}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleOpenFile(file)}
                          disabled={openingFileId === file.id}>
                          {openingFileId === file.id ? (
                            <SpinnerGap className="w-5 h-5 animate-spin" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-emerald-50 hover:text-emerald-600"
                          onClick={() => handleDownloadFile(file)}
                          disabled={downloadingFileId === file.id}>
                          {downloadingFileId === file.id ? (
                            <SpinnerGap className="w-5 h-5 animate-spin" />
                          ) : (
                            <DownloadSimple className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-none mb-1">{label}</p>
        <p className="text-sm font-medium text-slate-900 truncate">{value || '-'}</p>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-3.5 space-y-1.5 transition-colors hover:border-slate-300">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wider leading-none">{label}</p>
      </div>
      <p className="text-sm font-medium text-slate-900 break-words">{value || '-'}</p>
    </div>
  );
}



function FileIcon({ type }: { type: string }) {
  if (type === 'pdf') return <FilePdf size={24} weight="duotone" />;
  if (type === 'image') return <ImageIcon size={24} weight="duotone" />;
  return <File size={24} weight="duotone" />;
}

function getStatusMeta(status: number) {
  if (status === 1) {
    return { label: 'Aprovado', variant: 'secondary' as const };
  }

  if (status === 0) {
    return { label: 'Pendente', variant: 'outline' as const };
  }

  return { label: 'Reprovado', variant: 'default' as const };
}

function formatDateSimple(value?: string | null): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(parsed);
}

function formatDateLabel(value?: string | null): string {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
}

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return 'Tamanho não informado';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
