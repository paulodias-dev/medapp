import { useAuth } from '@/app/context/use-auth';
import { ClinicalResultListItem } from '@/app/models';
import { clientService } from '@/app/services/client';
import { DataTable } from '@/views/components/data-table';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/views/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { DownloadSimple, FunnelSimple, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { columns } from './columns';

function normalizeStatusLabel(status: number): string {
  if (status === 0) return 'Pendente';
  if (status === 1) return 'Realizado';
  if (status === 2) return 'Arquivado';
  if (status === 3) return 'Cancelado';
  return 'Reprovado';
}

function resolveExamDate(exam: ClinicalResultListItem): Date | null {
  const raw = exam.aso_date ?? exam.created_at ?? null;
  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDateForCsv(exam: ClinicalResultListItem): string {
  const date = resolveExamDate(exam);
  if (!date) return '-';

  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
}

function escapeCsvCell(value: unknown): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function Certificates() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const patientIdFilter = useMemo(() => {
    const rawValue = searchParams.get('patientId');
    if (!rawValue) return null;

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;

    return parsed;
  }, [searchParams]);

  const {
    data: getAllExams,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['getAllExams', user?.id ?? 'anonymous'],
    queryFn: clientService.getAllExams,
    retry: 1,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const examsData = useMemo(() => getAllExams ?? [], [getAllExams]);
  const examTypes = useMemo(() => {
    const set = new Set<string>();
    examsData.forEach((exam) => {
      const name = exam.clinical_type_result?.name?.trim();
      if (name) set.add(name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [examsData]);

  const filteredExamsData = useMemo(() => {
    const startBoundary = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const endBoundary = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    return examsData.filter((exam) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'other') {
          if ([0, 1, 2, 3].includes(Number(exam.status))) {
            return false;
          }
        } else if (String(exam.status) !== statusFilter) {
          return false;
        }
      }

      if (typeFilter !== 'all' && exam.clinical_type_result?.name !== typeFilter) {
        return false;
      }

      if (patientIdFilter !== null && Number(exam.patient?.id ?? 0) !== patientIdFilter) {
        return false;
      }

      const date = resolveExamDate(exam);
      if (!date) {
        return !startBoundary && !endBoundary;
      }

      if (startBoundary && date < startBoundary) {
        return false;
      }

      if (endBoundary && date > endBoundary) {
        return false;
      }

      return true;
    });
  }, [dateFrom, dateTo, examsData, patientIdFilter, statusFilter, typeFilter]);

  const table = useReactTable({
    data: filteredExamsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
  });

  const handleExportCsv = () => {
    const rows = table.getFilteredRowModel().rows.map((row) => row.original);
    if (rows.length === 0) {
      toast.info('Nenhum registro disponível para exportação.');
      return;
    }

    const header = [
      'ID',
      'ASO',
      'Data',
      'Status',
      'Colaborador',
      'Tipo de exame',
      'Telefone',
      'Email',
      'Criado em',
      'Atualizado em',
    ];

    const lines = rows.map((exam) => [
      exam.id,
      exam.aso_number ?? '-',
      formatDateForCsv(exam),
      normalizeStatusLabel(Number(exam.status)),
      exam.patient?.name ?? '-',
      exam.clinical_type_result?.name ?? '-',
      exam.patient?.phone1 ?? '-',
      exam.patient?.email ?? '-',
      exam.created_at ?? '-',
      exam.updated_at ?? '-',
    ]);

    const csvContent = [header, ...lines]
      .map((line) => line.map((cell) => escapeCsvCell(cell)).join(';'))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `atestados-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const clearPatientFilter = () => {
    if (patientIdFilter === null) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.delete('patientId');
    setSearchParams(params, { replace: true });
  };

  const clearAdvancedFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFrom('');
    setDateTo('');
    clearPatientFilter();
  };

  const hasAdvancedFilters =
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    patientIdFilter !== null;

  useEffect(() => {
    if (searchParams.get('focus') !== 'search') {
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 60);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Atestados
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Listagem de todos os ASO&apos;s da sua empresa.
            </p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
            {table.getFilteredRowModel().rows.length} registros encontrados
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <section className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 px-4 sm:px-6 py-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Listagem de ASOs
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Consulte, filtre e acesse os detalhes dos atestados da empresa.
              </p>
            </div>

            <div className="flex w-full lg:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                ref={searchInputRef}
                className="h-10 w-full sm:w-72 rounded-xl border-slate-200 text-sm"
                placeholder="Pesquisar por colaborador..."
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  table
                    .getColumn('patient_name')
                    ?.setFilterValue(event.target.value);
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-10 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap gap-2"
                onClick={handleExportCsv}
                disabled={table.getFilteredRowModel().rows.length === 0}>
                <DownloadSimple size={16} />
                Exportar CSV
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl h-10 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                <Link to="/certificate">Solicitar atestado</Link>
              </Button>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/40">
            {patientIdFilter !== null && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                <p className="text-xs font-semibold text-blue-700">
                  Filtrando por colaborador #{patientIdFilter}.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 rounded-lg px-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  onClick={clearPatientFilter}>
                  Remover filtro
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FunnelSimple size={14} />
                Filtros avançados
              </p>

              {hasAdvancedFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-lg text-xs font-semibold"
                  onClick={clearAdvancedFilters}>
                  <X size={14} />
                  Limpar filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 rounded-xl bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="0">Pendente</SelectItem>
                  <SelectItem value="1">Realizado</SelectItem>
                  <SelectItem value="2">Arquivado</SelectItem>
                  <SelectItem value="3">Cancelado</SelectItem>
                  <SelectItem value="other">Reprovado/Outros</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10 rounded-xl bg-white">
                  <SelectValue placeholder="Tipo de exame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {examTypes.map((typeName) => (
                    <SelectItem key={typeName} value={typeName}>
                      {typeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                className="h-10 rounded-xl bg-white"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />

              <Input
                type="date"
                className="h-10 rounded-xl bg-white"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>
          </div>

          {isLoading && (
            <div className="px-6 py-12 text-sm text-slate-400 text-center">
              Carregando atestados...
            </div>
          )}

          {isError && (
            <div className="px-6 py-12 text-center space-y-3">
              <p className="text-sm text-red-500">
                Não foi possível carregar a listagem de atestados.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void refetch();
                }}
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !isError && <DataTable columns={columns} table={table} />}
        </section>
      </div>
    </div>
  );
}
