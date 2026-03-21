import { useAppointment } from '@/app/context/appointment-context';
import { StoreExamPayload } from '@/app/services/client/appointment';
import { clientService } from '@/app/services/client';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Newspaper } from '@phosphor-icons/react';
import { ArrowUpRight, CheckCircle, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { canSubmitAppointmentReview } from './form-utils';

function formatDateLabel(date: string | null): string {
  if (!date) {
    return '-';
  }

  const [year, month, day] = date.split('-');
  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

export function ExamStep() {
  const navigate = useNavigate();
  const { data: appointmentData, setStepData, resetData } = useAppointment();

  const { mutate: submitAppointment, isPending: isSubmitting } = useMutation({
    mutationFn: (payload: StoreExamPayload) => clientService.appointment.storeExam(payload),
    onSuccess: () => {
      toast.success('Agendamento realizado com sucesso!');
      resetData();
      navigate('/certificates');
    },
    onError: () => {
      toast.error('Erro ao realizar agendamento. Tente novamente.');
    },
  });

  const handleSubmit = (selectedExams: string[]) => {
    setStepData('exams', selectedExams);

    const payload: StoreExamPayload = {
      date: appointmentData.date,
      time: appointmentData.time,
      patientId: appointmentData.patientId,
      employee: appointmentData.employee,
      type_id: appointmentData.type_id,
      exams: selectedExams,
      observations: appointmentData.observations,
    };

    submitAppointment(payload);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Etapa 4 de 4
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Exames do contrato
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Selecione os exames e confira o resumo antes de enviar.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-xl flex items-center justify-center gap-2 w-full md:w-auto">
            Contrato
            <Newspaper size={18} />
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <section className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6">
          <ExamList
            appointmentData={appointmentData}
            initialSelected={appointmentData.exams}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onBack={() => navigate(-1)}
          />
        </section>
      </div>
    </div>
  );
}

type AppointmentDataShape = ReturnType<typeof useAppointment>['data'];

interface ExamListProps {
  appointmentData: AppointmentDataShape;
  initialSelected: string[];
  onSubmit: (selected: string[]) => void;
  isSubmitting: boolean;
  onBack: () => void;
}

function ExamList({ appointmentData, initialSelected, onSubmit, isSubmitting, onBack }: ExamListProps) {
  const [search, setSearch] = useState('');
  const [selectedExams, setSelectedExams] = useState<string[]>(initialSelected);
  const [isReviewConfirmed, setIsReviewConfirmed] = useState(false);

  const { data: exams, isLoading } = useQuery({
    queryKey: ['available-exams'],
    queryFn: clientService.masterData.getAvailableExams,
  });

  const { data: examTypes = [] } = useQuery({
    queryKey: ['exam-types'],
    queryFn: clientService.masterData.getExamTypes,
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: clientService.masterData.getPositions,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: clientService.masterData.getDepartments,
  });

  const handleCheckboxChange = (id: string) => {
    setSelectedExams((previousValue) =>
      previousValue.includes(id)
        ? previousValue.filter((examId) => examId !== id)
        : [...previousValue, id],
    );
  };

  const filteredExams = (exams || []).filter((exam: { name: string }) =>
    exam.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedExamItems = useMemo(
    () =>
      (exams || []).filter((exam: { id: number }) => selectedExams.includes(String(exam.id))),
    [exams, selectedExams],
  );

  const selectedTypeName = useMemo(() => {
    const foundType = examTypes.find(
      (type: { id: number; name: string }) => type.id === appointmentData.type_id,
    );

    return foundType?.name ?? '-';
  }, [appointmentData.type_id, examTypes]);

  const selectedPositionName = useMemo(() => {
    const foundPosition = positions.find(
      (position: { id: number; name: string }) => position.id === appointmentData.employee.position_id,
    );

    return foundPosition?.name ?? '-';
  }, [appointmentData.employee.position_id, positions]);

  const selectedDepartmentName = useMemo(() => {
    const foundDepartment = departments.find(
      (department: { id: number; name: string }) =>
        department.id === appointmentData.employee.department_id,
    );

    return foundDepartment?.name ?? '-';
  }, [appointmentData.employee.department_id, departments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(330px,360px)]">
      <div className="flex flex-col gap-6">
        <div className="mb-1">
          <Input
            type="text"
            placeholder="Pesquisar exames..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[420px] rounded-2xl border border-slate-100 p-3 sm:p-4">
          {filteredExams.map((exam: { id: number; name: string; description?: string | null }) => (
            <div
              key={exam.id}
              onClick={() => handleCheckboxChange(String(exam.id))}
              className={`border rounded-xl px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${
                selectedExams.includes(String(exam.id))
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              }`}>
              <div className="flex flex-col justify-center">
                <p className="font-normal">{exam.name}</p>
                <p className="text-sm text-gray-400">{exam.description || 'Sem descrição'}</p>
              </div>

              {selectedExams.includes(String(exam.id)) ? (
                <CheckCircle className="text-primary w-5 h-5" />
              ) : (
                <input
                  type="checkbox"
                  checked={false}
                  onChange={(event) => event.stopPropagation()}
                  className="w-5 h-5 cursor-pointer"
                />
              )}
            </div>
          ))}

          {filteredExams.length === 0 && (
            <p className="text-center text-gray-400 py-4">Nenhum exame encontrado.</p>
          )}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5 h-fit xl:sticky xl:top-24">
        <h3 className="text-base font-black text-slate-900">Resumo para conferência</h3>
        <p className="mt-1 text-sm text-slate-500">
          Revise os dados antes de confirmar o envio da solicitação.
        </p>

        <div className="mt-4 space-y-4 text-sm">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="font-semibold text-slate-800">Agendamento</p>
            <p className="text-slate-600 mt-1">
              Data: {formatDateLabel(appointmentData.date)}
            </p>
            <p className="text-slate-600">Horário: {appointmentData.time ?? '-'}</p>
            <p className="text-slate-600">Tipo: {selectedTypeName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="font-semibold text-slate-800">Colaborador</p>
            <p className="text-slate-600 mt-1">Nome: {appointmentData.employee.name || '-'}</p>
            <p className="text-slate-600">CPF: {appointmentData.employee.cpf || '-'}</p>
            <p className="text-slate-600">E-mail: {appointmentData.employee.email || '-'}</p>
            <p className="text-slate-600">Telefone: {appointmentData.employee.phone || '-'}</p>
            <p className="text-slate-600">Cargo: {selectedPositionName}</p>
            <p className="text-slate-600">Setor: {selectedDepartmentName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="font-semibold text-slate-800">Exames selecionados</p>
            {selectedExamItems.length > 0 ? (
              <ul className="mt-2 space-y-1 text-slate-600">
                {selectedExamItems.map((exam: { id: number; name: string }) => (
                  <li key={exam.id}>• {exam.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 mt-1">Nenhum exame selecionado.</p>
            )}
          </div>

          <label className="flex items-start gap-2 text-slate-700">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
              checked={isReviewConfirmed}
              onChange={(event) => setIsReviewConfirmed(event.target.checked)}
            />
            <span>Conferi o resumo e confirmo os dados da solicitação.</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end border-t border-slate-200 pt-5 mt-5">
          <Button
            type="button"
            onClick={onBack}
            variant="ghost"
            className="rounded-xl">
            Voltar
          </Button>

          <Button
            type="button"
            onClick={() => onSubmit(selectedExams)}
            disabled={!canSubmitAppointmentReview(selectedExams, isReviewConfirmed, isSubmitting)}
            className="rounded-xl gap-1">
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-1" />
                Enviando...
              </>
            ) : (
              <>
                Confirmar e enviar
                <ArrowUpRight className="w-4" />
              </>
            )}
          </Button>
        </div>
      </aside>
    </div>
  );
}
