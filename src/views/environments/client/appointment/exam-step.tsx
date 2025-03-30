import { Button } from '@/views/components/ui/button';
import { Newspaper } from '@phosphor-icons/react';
import { ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function ExamStep() {
  const navigate = useNavigate();
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
          <div className="w-full max-w-[400px]">
            <h1 className="text-2xl mb-2 font-medium">Dados do Colaborador</h1>

            <p className="font-light text-slate-400">
              Informe os dados do colaborador da empresa para continuar o
              contrato.
            </p>
          </div>

          <form action="" className="w-full flex flex-col gap-6">
            <ExamList />

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
                <Link to="/certificate/type">
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

import { useState } from 'react';
import { Input } from '@/views/components/ui/input';

const exams = [
  { name: 'ACUIDADE VISUAL', description: 'Exame de acuidade visual' },
  { name: 'ASO', description: 'Atestado de saúde ocupacional' },
  { name: 'LAB 01', description: 'Exame realizado no laboratório 01' },
  {
    name: 'ÁCIDO TRANS-MUCÔNICO',
    description: 'Detecção de exposição a solventes',
  },
  { name: 'EAS - URINA', description: 'Exame de análise da urina' },
  { name: 'AUDIOMETRIA', description: 'Teste de audição' },
  { name: 'BIOMÉTRICO', description: 'Exame biométrico' },
  {
    name: 'CARBOXIEMOGLOBINA',
    description: 'Nível de exposição a monóxido de carbono',
  },
  { name: 'DECLARAÇÃO HBS', description: 'Declaração de Hepatite B' },
  { name: 'LAB 02', description: 'Exame realizado no laboratório 02' },
  { name: 'EPWORTH', description: 'Teste de sonolência diurna' },
  { name: 'ESPIROMETRIA', description: 'Exame de função pulmonar' },
  { name: 'GLICEMIA', description: 'Teste de glicemia' },
  { name: 'HEMOGRAMA', description: 'Análise completa do sangue' },
  { name: 'LABORATORIO', description: 'Exames laboratoriais gerais' },
  { name: 'LAUDO ECG', description: 'Relatório de eletrocardiograma' },
  { name: 'LAUDO EEG', description: 'Relatório de eletroencefalograma' },
  { name: 'OFTALMOLOGICO', description: 'Avaliação oftalmológica' },
  { name: 'PSICOSSOCIAL', description: 'Avaliação psicossocial' },
  { name: 'RETICULOCITOS', description: 'Contagem de reticulócitos' },
  { name: 'RX COLUNA TOTAL', description: 'Raio X da coluna total' },
  { name: 'RX COLUNA VERTEBRAL', description: 'Raio X da coluna vertebral' },
  { name: 'RX LOMBO SACRA', description: 'Raio X da região lombo sacral' },
  { name: 'RX TÓRAX', description: 'Raio X do tórax' },
  { name: 'RX TORAX OIT', description: 'Raio X do tórax com OIT' },
  { name: 'TOXICOLOGICO', description: 'Exame toxicológico' },
  { name: 'TRAÇADO ECG', description: 'Traçado do eletrocardiograma' },
  { name: 'TRAÇADO EEG', description: 'Traçado do eletroencefalograma' },
  { name: 'TRANS- MUCONICO', description: 'Detecção de exposição a solventes' },
  { name: 'NÃO INFORMADO', description: 'Exame sem informação específica' },
];

export default function ExamList() {
  const [search, setSearch] = useState('');
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  const handleCheckboxChange = (name: string) => {
    setSelectedExams((prev) =>
      prev.includes(name)
        ? prev.filter((exam) => exam !== name)
        : [...prev, name],
    );
  };

  const filteredExams = exams.filter((exam) =>
    exam.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Pesquisar exames..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[400px]">
        {filteredExams.map((exam) => (
          <div
            key={exam.name}
            onClick={() => handleCheckboxChange(exam.name)}
            className={`border rounded-xl px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
              selectedExams.includes(exam.name)
                ? 'border-primary bg-primary-50'
                : ''
            }`}>
            <div className="flex flex-col justify-center">
              <p className="font-normal">{exam.name}</p>
              <p className="text-sm text-gray-400">{exam.description}</p>
            </div>

            <input
              type="checkbox"
              checked={selectedExams.includes(exam.name)}
              onChange={(e) => e.stopPropagation()}
              className="w-5 h-5 cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
