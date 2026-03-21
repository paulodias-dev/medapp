import { useAppointment } from '@/app/context/appointment-context';
import { useAppointmentSettings } from '@/app/hooks/use-appointment-settings';
import { clientService } from '@/app/services/client';
import { Button } from '@/views/components/ui/button';
import { Textarea } from '@/views/components/ui/textarea';
import {
  ArrowCircleUp,
  Brain,
  Clock,
  FileText,
  Heartbeat,
  Newspaper,
  ShieldCheck,
  UserMinus,
  UserPlus,
  Virus,
  Wheelchair,
} from '@phosphor-icons/react';
import { Label } from '@/views/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const iconMap: Record<string, React.ReactNode> = {
  Admissional: <UserPlus size={24} />,
  Periódico: <Clock size={24} />,
  Demissional: <UserMinus size={24} />,
  'Retorno ao trabalho': <ArrowCircleUp size={24} />,
  Psicotécnico: <Brain size={24} />,
  Genérico: <FileText size={24} />,
  'COVID-19': <Virus size={24} />,
  'Evolução médica': <Heartbeat size={24} />,
  'Avaliação PCD': <Wheelchair size={24} />,
  'Mudança de risco ocupacional': <ShieldCheck size={24} />,
};

export function TypeExamStep() {
  const navigate = useNavigate();
  const { isSchedulingEnabled } = useAppointmentSettings();
  const { data: appointmentData, setStepData } = useAppointment();
  const [selectedOption, setSelectedOption] = useState<number | null>(appointmentData.type_id);
  const [observations, setObservations] = useState(appointmentData.observations);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const { data: types, isLoading } = useQuery({
    queryKey: ['exam-types'],
    queryFn: clientService.masterData.getExamTypes,
  });

  const handleSelect = (id: number) => {
    setSelectedOption(id);
    setStepData('type_id', id);
  };

  const handleContinue = () => {
    setShowValidationErrors(true);

    if (!selectedOption) {
      toast.error('Selecione o tipo de exame para continuar.');
      return;
    }

    if (observations.trim().length < 5) {
      toast.error('Informe observações com pelo menos 5 caracteres.');
      return;
    }

    setStepData('observations', observations);
    navigate('/certificate/exam');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {isSchedulingEnabled ? 'Etapa 3 de 4' : 'Etapa 2 de 3'}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Tipo de exame
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Selecione o tipo de exame ocupacional para esta solicitação.
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
          <form className="w-full flex flex-col gap-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={36} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {(types || []).map((item: any) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`h-full rounded-2xl border-2 p-3 text-left transition-colors ${
                      selectedOption === item.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => handleSelect(item.id)}>
                    <div className="flex h-full flex-col justify-center gap-2">
                      {iconMap[item.name] || <FileText size={24} />}
                      <p className="font-medium text-sm leading-tight">{item.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="w-full flex flex-col gap-2">
              <Label>
                Observações
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Informe observações relevantes..."
                className={`w-full min-h-[150px] rounded-xl ${
                  showValidationErrors && observations.trim().length < 5
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
              {showValidationErrors && observations.trim().length < 5 && (
                <p className="text-xs font-medium text-red-600">
                  Informe observações com pelo menos 5 caracteres.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end border-t border-slate-100 pt-5 mt-2">
              <Button
                type="button"
                onClick={() => navigate(-1)}
                variant="ghost"
                className="rounded-xl">
                Voltar
              </Button>

              <Button
                type="button"
                onClick={handleContinue}
                disabled={!selectedOption}
                className="rounded-xl gap-1">
                Continuar
                <ArrowUpRight className="w-4" />
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
