import { useAppointment } from '@/app/context/appointment-context';
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
  const { data: appointmentData, setStepData } = useAppointment();
  const [selectedOption, setSelectedOption] = useState<number | null>(appointmentData.type_id);
  const [observations, setObservations] = useState(appointmentData.observations);

  const { data: types, isLoading } = useQuery({
    queryKey: ['exam-types'],
    queryFn: clientService.masterData.getExamTypes,
  });

  const handleSelect = (id: number) => {
    setSelectedOption(id);
    setStepData('type_id', id);
  };

  const handleContinue = () => {
    setStepData('observations', observations);
    navigate('/certificate/exam');
  };

  return (
    <>
      <hr className="border-b-[10px] border-[#f5f5f5]" />

      <div className="animate-slidein600 opacity-0 container max-w-[1024px] flex-auto flex flex-col py-6">
        <div className="flex items-center gap-2">
          <button className="bg-primary text-white rounded-xl flex items-center justify-center gap-2 px-4 py-2">
            <p className="font-normal">4/5</p>
          </button>

          <Button
            variant="outline"
            className="rounded-xl flex items-center justify-center gap-2">
            <p className="font-normal">Contrato</p>
            <Newspaper size={20} />
          </Button>
        </div>

        <div className="flex gap-8 flex-auto mt-4">
          <div className=" w-full max-w-[400px]">
            <h1 className="text-2xl mb-2 font-medium">Tipo de Exame</h1>

            <p className="font-light text-slate-400">
              Selecione o tipo de exame que será realizado para continuar o
              processo.
            </p>
          </div>

          <form action="" className="w-full flex flex-col gap-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(types || []).map((item: any) => (
                  <div
                    key={item.id}
                    className={`p-2 h-[90px] ${
                      item.name.length > 20 && 'col-span-2'
                    } border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedOption === item.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-100'
                    }`}
                    onClick={() => handleSelect(item.id)}>
                    <button
                      type="button"
                      className="w-full h-full flex flex-col justify-center gap-2">
                      {iconMap[item.name] || <FileText size={24} />}
                      <p className="max-w-[150px] font-normal text-sm text-start leading-tight">
                        {item.name}
                      </p>
                    </button>
                  </div>
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
                className="w-full min-h-[150px] rounded-xl"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            <div className="flex gap-2 mt-auto">
              <Button
                type="button"
                onClick={() => navigate(-1)}
                variant="ghost"
                className="w-fit rounded-xl flex items-center justify-between gap-1 ml-auto">
                Voltar
              </Button>

              <Button
                type="button"
                onClick={handleContinue}
                disabled={!selectedOption}
                className="w-fit rounded-xl flex items-center justify-between gap-1">
                Continuar
                <ArrowUpRight className="w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
