import { createContext, useContext, useState, ReactNode } from 'react';

interface AppointmentData {
  date: string | null;
  time: string | null;
  employee: {
    cpf: string;
    rg: string;
    birthDate: string;
    gender: string;
    maritalStatus: string;
    position_id: number | null;
    department_id: number | null;
    email: string;
    phone: string;
    altPhone: string;
  };
  type_id: number | null;
  exams: string[];
  observations: string;
}

interface AppointmentContextType {
  data: AppointmentData;
  setStepData: (step: keyof AppointmentData, stepData: any) => void;
  resetData: () => void;
}

const initialData: AppointmentData = {
  date: null,
  time: null,
  employee: {
    cpf: '',
    rg: '',
    birthDate: '',
    gender: '',
    maritalStatus: '',
    position_id: null,
    department_id: null,
    email: '',
    phone: '',
    altPhone: '',
  },
  type_id: null,
  exams: [],
  observations: '',
};

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppointmentData>(initialData);

  const setStepData = (step: keyof AppointmentData, stepData: any) => {
    setData((prev) => ({
      ...prev,
      [step]: stepData,
    }));
  };

  const resetData = () => setData(initialData);

  return (
    <AppointmentContext.Provider value={{ data, setStepData, resetData }}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointment() {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
}
