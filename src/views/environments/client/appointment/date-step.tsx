import { Button } from '@/views/components/ui/button';
import { Newspaper } from '@phosphor-icons/react';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Calendar } from './components/calendar';

export function DateStep() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const morningHours = ['08:00', '09:00', '10:00', '11:00'];
  const afternoonHours = ['13:00', '14:00', '15:00', '16:00'];

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  return (
    <>
      <hr className="border-b-[10px] border-[#f5f5f5]" />

      <div className="animate-slidein600 opacity-0 container max-w-[1024px] flex-auto flex flex-col py-6">
        <div className="flex items-center gap-2">
          <Button className="rounded-xl flex items-center justify-center gap-2">
            <p className="font-normal">1/8</p>
          </Button>

          <Button
            variant="outline"
            className="rounded-xl flex items-center justify-center gap-2">
            <p className="font-normal">Contrato</p>
            <Newspaper size={20} />
          </Button>
        </div>

        <div className="flex gap-8 flex-auto mt-4">
          <div className="w-full">
            <h1 className="text-2xl mb-2 font-medium">Horários disponíveis</h1>
            <p className="font-light text-slate-400">
              {selectedDate
                ? `${selectedDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                  })}`
                : 'Selecione uma data'}
            </p>

            <div>
              <h2 className="text-lg py-2 border-b font-semibold">Manhã</h2>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {morningHours.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    className="text-sm"
                    onClick={() => handleTimeSelect(time)}>
                    {time}
                  </Button>
                ))}
              </div>

              <h2 className="text-lg py-2 border-b font-semibold mt-4">
                Tarde
              </h2>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {afternoonHours.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    className="text-sm"
                    onClick={() => handleTimeSelect(time)}>
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <form action="" className="w-full max-w-[400px] flex flex-col gap-6">
            <Calendar
              onDateSelect={(date: Date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
            />

            <div className="text-center">
              <p className="font-light text-slate-400">
                {selectedTime
                  ? `Você selecionou: ${selectedDate?.toLocaleDateString(
                      'pt-BR',
                    )} às ${selectedTime}`
                  : 'Selecione um horário para continuar'}
              </p>
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
                disabled={!selectedDate || !selectedTime}
                className="w-fit rounded-xl flex items-center justify-between gap-1">
                <Link to="/certificate/employee">
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
