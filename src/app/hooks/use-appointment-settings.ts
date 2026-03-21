import { clientService } from '@/app/services/client';
import { useQuery } from '@tanstack/react-query';

export type AppointmentRequestMode = 'scheduled' | 'unscheduled';

export function resolveAppointmentEntryPath(mode: AppointmentRequestMode): string {
  return mode === 'unscheduled' ? '/certificate/employee' : '/certificate/date';
}

export function useAppointmentSettings() {
  const query = useQuery({
    queryKey: ['appointment-settings'],
    queryFn: clientService.getAppointmentSettings,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const requestMode: AppointmentRequestMode =
    query.data?.request_mode === 'unscheduled' ? 'unscheduled' : 'scheduled';

  return {
    ...query,
    requestMode,
    entryPath: resolveAppointmentEntryPath(requestMode),
    isSchedulingEnabled: requestMode === 'scheduled',
  };
}

