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
    <>
      <hr className="border-b-[10px] border-[#f5f5f5]" />

      <div className="animate-slidein600 opacity-0 container max-w-[1024px] flex-auto flex flex-col py-6">
        <div className="flex items-center gap-2">
          <button className="bg-primary text-white rounded-xl flex items-center justify-center gap-2 px-4 py-2">
            <p className="font-normal">5/5</p>
          </button>

          <Button
            variant="outline"
            className="rounded-xl flex items-center justify-center gap-2">
            <p className="font-normal">Contrato</p>
            <Newspaper size={20} />
          </Button>
        </div>

        <div className="flex gap-8 flex-auto mt-4">
          <div className="w-full max-w-[400px]">
            <h1 className="text-2xl mb-2 font-medium">Exames do Contrato</h1>

            <p className="font-light text-slate-400">
              Selecione os exames que farão parte deste contrato/agendamento.
            </p>
          </div>

          <div className="w-full flex flex-col gap-6">
            <ExamList
              initialSelected={appointmentData.exams}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onBack={() => navigate(-1)}
            />
          </div>
        </div>
      </div>
    </>
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
      <div className="mb-2">
        <Input
          type="text"
          placeholder="Pesquisar exames..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[400px]">
        {filteredExams.map((exam: any) => (
          <div
            key={exam.id}
            onClick={() => handleCheckboxChange(String(exam.id))}
            className={`border rounded-xl px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
              selectedExams.includes(String(exam.id))
                ? 'border-primary bg-primary/5'
                : ''
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

      <div className="flex gap-2 mt-auto">
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="w-fit rounded-xl flex items-center justify-between gap-1 ml-auto">
          Voltar
        </Button>

        <Button
          type="button"
          onClick={() => onSubmit(selectedExams)}
          disabled={selectedExams.length === 0 || isSubmitting}
          className="w-fit rounded-xl flex items-center justify-between gap-1">
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
