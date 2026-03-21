import { clientService } from '@/app/services/client';
import { useAppointmentSettings } from '@/app/hooks/use-appointment-settings';
import { Button } from '@/views/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Newspaper } from '@phosphor-icons/react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, isBefore, startOfDay } from 'date-fns';

import { Calendar } from './components/calendar';

import { useAppointment } from '@/app/context/appointment-context';

export function DateStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSchedulingEnabled, isLoading: appointmentSettingsLoading } = useAppointmentSettings();
  const { data: appointmentData, setStepData } = useAppointment();
  const today = startOfDay(new Date());
  const initialDate =
    appointmentData.date && !isBefore(startOfDay(new Date(appointmentData.date)), today)
      ? new Date(appointmentData.date)
      : null;
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(appointmentData.time);

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  const { data: availableSchedules, isLoading } = useQuery({
    queryKey: ['available-schedules', formattedDate],
    queryFn: () => clientService.appointment.getSchedules(formattedDate!),
    enabled: !!formattedDate && isSchedulingEnabled,
  });

  useEffect(() => {
    if (!appointmentSettingsLoading && !isSchedulingEnabled) {
      navigate(
        {
          pathname: '/certificate/employee',
          search: location.search,
        },
        { replace: true },
      );
    }
  }, [appointmentSettingsLoading, isSchedulingEnabled, location.search, navigate]);

  if (appointmentSettingsLoading || !isSchedulingEnabled) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-medium text-slate-400">
        Carregando...
      </div>
    );
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStepData('time', time);
  };

  const handleDateSelect = (date: Date) => {
    if (isBefore(startOfDay(date), today)) {
      return;
    }

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
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Etapa 1 de 4
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Data e horário
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {selectedDate
                ? selectedDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                  })
                : 'Selecione uma data no calendário para carregar horários disponíveis.'}
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <section className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6">
            <h2 className="text-lg font-black text-slate-900">Horários disponíveis</h2>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              Escolha o melhor período para o atendimento.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={36} />
              </div>
            ) : selectedDate ? (
              <div className="mt-6 space-y-6">
                {morningHours.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 border-b border-slate-100 pb-2">
                      Manhã
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                      {morningHours.map((time: string) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          className="text-sm rounded-xl"
                          onClick={() => handleTimeSelect(time)}>
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {afternoonHours.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 border-b border-slate-100 pb-2">
                      Tarde
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                      {afternoonHours.map((time: string) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          className="text-sm rounded-xl"
                          onClick={() => handleTimeSelect(time)}>
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {scheduleList.length === 0 && (
                  <p className="text-center text-slate-400 py-10">
                    Nenhum horário disponível para esta data.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-400">Aguardando seleção de data...</p>
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6 flex flex-col gap-5 h-fit xl:sticky xl:top-24">
            <Calendar onDateSelect={handleDateSelect} />

            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 font-medium">
              {selectedTime
                ? `Selecionado: ${selectedDate?.toLocaleDateString('pt-BR')} às ${selectedTime}`
                : 'Selecione um horário disponível para continuar.'}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                type="button"
                onClick={() => navigate(-1)}
                variant="ghost"
                className="rounded-xl">
                Voltar
              </Button>

              <Button
                type="button"
                disabled={!selectedDate || !selectedTime}
                onClick={() =>
                  navigate({
                    pathname: '/certificate/employee',
                    search: location.search,
                  })
                }
                className="rounded-xl gap-1">
                Continuar
                <ArrowUpRight className="w-4" />
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
