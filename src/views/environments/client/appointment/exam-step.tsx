import { useAppointment } from '@/app/context/appointment-context';
import { clientService } from '@/app/services/client';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Newspaper } from '@phosphor-icons/react';
import { ArrowUpRight, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

export function ExamStep() {
  const navigate = useNavigate();
  const { data: appointmentData, setStepData, resetData } = useAppointment();

  const { mutate: submitAppointment, isPending: isSubmitting } = useMutation({
    mutationFn: (payload: any) => clientService.appointment.storeExam(payload),
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
    submitAppointment({
      date: appointmentData.date,
      time: appointmentData.time,
      employee: appointmentData.employee,
      type_id: appointmentData.type_id,
      exams: selectedExams,
      observations: appointmentData.observations,
    });
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
              Selecione os exames que farão parte deste encaminhamento.
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

interface ExamListProps {
  initialSelected: string[];
  onSubmit: (selected: string[]) => void;
  isSubmitting: boolean;
  onBack: () => void;
}

function ExamList({ initialSelected, onSubmit, isSubmitting, onBack }: ExamListProps) {
  const [search, setSearch] = useState('');
  const [selectedExams, setSelectedExams] = useState<string[]>(initialSelected);

  const { data: exams, isLoading } = useQuery({
    queryKey: ['available-exams'],
    queryFn: clientService.masterData.getAvailableExams,
  });

  const handleCheckboxChange = (id: string) => {
    setSelectedExams((prev) =>
      prev.includes(id) ? prev.filter((examId) => examId !== id) : [...prev, id],
    );
  };

  const filteredExams = (exams || []).filter((exam: any) =>
    exam.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
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
        {filteredExams.map((exam: any) => (
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
                onChange={(e) => e.stopPropagation()}
                className="w-5 h-5 cursor-pointer"
              />
            )}
          </div>
        ))}

        {filteredExams.length === 0 && (
          <p className="text-center text-gray-400 py-4">Nenhum exame encontrado.</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end border-t border-slate-100 pt-5 mt-1">
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
          disabled={selectedExams.length === 0 || isSubmitting}
          className="rounded-xl gap-1">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 mr-1" />
              Enviando...
            </>
          ) : (
            <>
              Finalizar
              <ArrowUpRight className="w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
