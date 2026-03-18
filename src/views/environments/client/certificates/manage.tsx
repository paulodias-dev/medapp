import {
  ClinicalResultExamFile,
  ClinicalResultListItem,
} from '@/app/models';
import { clientService } from '@/app/services/client';
import { Badge } from '@/views/components/ui/badge';
import { Button } from '@/views/components/ui/button';
import { ScrollArea } from '@/views/components/ui/scroll-area';
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
import { Eye, File, FilePdf, SpinnerGap } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
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
  const [openingPdf, setOpeningPdf] = useState(false);

  const detailQuery = useQuery({
    queryKey: ['exam-details', exam.id],
    queryFn: () => clientService.getExamById(exam.id),
    enabled: open,
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  const details = detailQuery.data?.data;
  if (details) console.log('ASO Details:', details);
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Detalhes
        </Button>
      </SheetTrigger>

      <SheetContent className="!w-[640px] !max-w-[640px] z-[999999999] rounded-2xl flex flex-col gap-4 overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <span>ASO #{exam.aso_number ?? exam.id}</span>
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          </SheetTitle>
          <SheetDescription>
            Gerenciamento do atestado de saúde ocupacional.
          </SheetDescription>
        </SheetHeader>

        <div className="rounded-2xl border p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoItem label="Paciente" value={patientName} />
            <InfoItem label="Tipo de Exame" value={examType} />
            <InfoItem label="Telefone" value={patientPhone} />
            <InfoItem label="E-mail" value={patientEmail} />
            <InfoItem label="Data do ASO" value={formatDateLabel(details?.aso_date ?? exam.aso_date)} />
            <InfoItem label="Criado em" value={formatDateLabel(details?.created_at ?? exam.created_at)} />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
            <div>
              <p className="font-medium">Resumo dos anexos</p>
              <p>
                Com arquivo: {details?.withFilesCount ?? 0} | Sem arquivo:{' '}
                {details?.withoutFilesCount ?? 0}
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={handleOpenPdf}
              disabled={openingPdf}>
              {openingPdf ? (
                <SpinnerGap className="h-4 w-4 animate-spin" />
              ) : (
                <FilePdf className="h-4 w-4" />
              )}
              Abrir PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">Informações</TabsTrigger>
            <TabsTrigger value="files">Arquivos</TabsTrigger>
          </TabsList>

          <Separator className="my-4" />

          <TabsContent value="general" className="space-y-3">
            {detailQuery.isLoading && (
              <div className="rounded-xl border p-4 text-sm text-slate-500">
                Carregando detalhes do ASO...
              </div>
            )}

            {detailQuery.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Não foi possível carregar os detalhes deste ASO.
              </div>
            )}

            {!detailQuery.isLoading && !detailQuery.isError && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoItem label="ID do Registro" value={String(exam.id)} />
                <InfoItem label="Número do ASO" value={String(exam.aso_number ?? exam.id)} />
                <InfoItem label="Status" value={statusMeta.label} />
                <InfoItem label="Visibilidade" value={exam.public ? 'Público' : 'Privado'} />
                <InfoItem
                  label="Atualizado em"
                  value={formatDateLabel(details?.updated_at ?? exam.updated_at)}
                />
                <InfoItem
                  label="Exames vinculados"
                  value={String(details?.clinicalResultExams?.length ?? 0)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="files">
            {detailQuery.isLoading && (
              <div className="rounded-xl border p-4 text-sm text-slate-500">
                Carregando arquivos...
              </div>
            )}

            {detailQuery.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Não foi possível carregar os arquivos deste ASO.
              </div>
            )}

            {!detailQuery.isLoading && !detailQuery.isError && (
              <ScrollArea className="h-[380px] pr-2">
                {files.length === 0 ? (
                  <div className="rounded-xl border p-4 text-sm text-slate-500">
                    Este ASO ainda não possui arquivos anexados.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-2xl border px-3 py-3 flex items-center gap-3 relative">
                        <div className="border rounded-xl relative p-2">
                          <File className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 pr-14">
                          <p className="text-sm truncate">{file.name ?? `Arquivo #${file.id}`}</p>
                          <p className="text-xs text-slate-500">
                            {file.examName} | {formatFileSize(file.size)}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 my-auto right-3"
                          onClick={() => handleOpenFile(file)}
                          disabled={openingFileId === file.id}>
                          {openingFileId === file.id ? (
                            <SpinnerGap className="w-5 h-5 animate-spin" />
                          ) : (
                            <Eye className="w-5 h-5" />
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm mt-1 break-words">{value || '-'}</p>
    </div>
  );
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
