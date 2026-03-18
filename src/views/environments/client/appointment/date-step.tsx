import { clientService } from '@/app/services/client';
import { Button } from '@/views/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Newspaper } from '@phosphor-icons/react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import { Calendar } from './components/calendar';

import { useAppointment } from '@/app/context/appointment-context';

export function DateStep() {
  const navigate = useNavigate();
  const { data: appointmentData, setStepData } = useAppointment();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    appointmentData.date ? new Date(appointmentData.date) : null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(appointmentData.time);

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  const { data: availableSchedules, isLoading } = useQuery({
    queryKey: ['available-schedules', formattedDate],
    queryFn: () => clientService.appointment.getSchedules(formattedDate!),
    enabled: !!formattedDate,
  });

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStepData('time', time);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStepData('date', format(date, 'yyyy-MM-dd'));
    setStepData('time', null);
  };

  const scheduleList = availableSchedules || [];
  const morningHours = scheduleList
    .filter((s: any) => s.time < '12:00')
    .map((s: any) => s.time);
  const afternoonHours = scheduleList
    .filter((s: any) => s.time >= '12:00')
    .map((s: any) => s.time);

  return (
    <>
      <hr className="border-b-[10px] border-[#f5f5f5]" />

      <div className="animate-slidein600 opacity-0 container max-w-[1024px] flex-auto flex flex-col py-6">
        <div className="flex items-center gap-2">
          <button className="bg-primary text-white rounded-xl flex items-center justify-center gap-2 px-4 py-2">
            <p className="font-normal">1/5</p>
          </button>

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
                : 'Selecione uma data no calendário'}
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : selectedDate ? (
              <div>
                {morningHours.length > 0 && (
                  <>
                    <h2 className="text-lg py-2 border-b font-semibold">Manhã</h2>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {morningHours.map((time: string) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          className="text-sm"
                          onClick={() => handleTimeSelect(time)}>
                          {time}
                        </Button>
                      ))}
                    </div>
                  </>
                )}

                {afternoonHours.length > 0 && (
                  <>
                    <h2 className="text-lg py-2 border-b font-semibold mt-4">
                      Tarde
                    </h2>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {afternoonHours.map((time: string) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          className="text-sm"
                          onClick={() => handleTimeSelect(time)}>
                          {time}
                        </Button>
                      ))}
                    </div>
                  </>
                )}

                {scheduleList.length === 0 && (
                  <p className="text-center text-gray-400 py-10">Nenhum horário disponível para esta data.</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-10">
                <p className="text-gray-400">Aguardando seleção de data...</p>
              </div>
            )}
          </div>

          <div className="w-full max-w-[400px] flex flex-col gap-6">
            <Calendar
              onDateSelect={handleDateSelect}
            />

            <div className="text-center">
              <p className="font-light text-slate-400">
                {selectedTime
                  ? `Você selecionou: ${selectedDate?.toLocaleDateString(
                      'pt-BR',
                    )} às ${selectedTime}`
                  : 'Selecione um horário disponível'}
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
          </div>
        </div>
      </div>
    </>
  );
}
