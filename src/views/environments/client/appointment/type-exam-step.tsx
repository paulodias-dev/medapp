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
import { Label } from '@radix-ui/react-dropdown-menu';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const options = [
  { value: 'admissional', icon: <UserPlus size={24} />, label: 'Admissional' },
  { value: 'periodico', icon: <Clock size={24} />, label: 'Periódico' },
  { value: 'demissional', icon: <UserMinus size={24} />, label: 'Demissional' },
  {
    value: 'retorno',
    icon: <ArrowCircleUp size={24} />,
    label: 'Retorno ao trabalho',
  },
  { value: 'psicotecnico', icon: <Brain size={24} />, label: 'Psicotécnico' },
  { value: 'generico', icon: <FileText size={24} />, label: 'Genérico' },
  { value: 'covid', icon: <Virus size={24} />, label: 'COVID-19' },
  {
    value: 'evolucao',
    icon: <Heartbeat size={24} />,
    label: 'Evolução médica',
  },
  { value: 'pcd', icon: <Wheelchair size={24} />, label: 'Avaliação PCD' },
  {
    value: 'risco',
    icon: <ShieldCheck size={24} />,
    label: 'Mudança de risco ocupacional',
  },
];

export function TypeExamStep() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelectedOption(value);
  };

  return (
    <>
      <hr className="border-b-[10px] border-[#f5f5f5]" />

      <div className="animate-slidein600 opacity-0 container max-w-[1024px] flex-auto flex flex-col py-6">
        <div className="flex items-center gap-2">
          <Button className="rounded-xl flex items-center justify-center gap-2">
            <p className="font-normal">6/8</p>
          </Button>

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {options.map((item, index) => (
                <div
                  key={index}
                  className={`p-2 h-[90px] ${
                    item.label.length > 20 && 'col-span-2'
                  } border-2 rounded-xl cursor-pointer transition-colors ${
                    selectedOption === item.value
                      ? 'border-primary'
                      : 'border-gray-100'
                  }`}
                  onClick={() => handleSelect(item.value)}>
                  <button
                    type="button"
                    className="w-full flex flex-col justify-center gap-2">
                    {item.icon}
                    <p className="max-w-[150px] font-normal text-sm text-start">
                      {item.label}
                    </p>
                  </button>
                </div>
              ))}
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label>
                Observações
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Informe o CPF"
                className="w-full min-h-[200px] rounded-xl"
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
                asChild
                className="w-fit rounded-xl flex items-center justify-between gap-1">
                <Link to="/certificate/exam">
                  Continuar
                  <ArrowUpRight className="w-4" />
                </Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
