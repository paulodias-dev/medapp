import { useAppointment } from '@/app/context/appointment-context';
import { ClientPatientListItem } from '@/app/models';
import { clientService } from '@/app/services/client';
import { maskRGIE, phoneMask } from '@/app/utils';
import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import { Label } from '@/views/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/views/components/ui/select';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Newspaper } from '@phosphor-icons/react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AppointmentEmployeeForm,
  cpfMask,
  digitsOnly,
  isValidCpf,
  mapPatientAutofill,
  validateEmployee,
} from './form-utils';

type LookupState = 'idle' | 'searching' | 'found' | 'not_found' | 'error';

export function EmployeeDataStep() {
  const navigate = useNavigate();
  const { data: appointmentData, setStepData } = useAppointment();
  const employee = appointmentData.employee;

  const [lookupState, setLookupState] = useState<LookupState>('idle');
  const [lookupMessage, setLookupMessage] = useState('');
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const lastSearchedCpfRef = useRef('');

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: clientService.masterData.getDepartments,
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: clientService.masterData.getPositions,
  });

  const updateEmployee = (field: keyof typeof employee, value: string | number | null) => {
    setStepData('employee', { ...employee, [field]: value });
  };

  const applyPatientAutofill = (patient: ClientPatientListItem) => {
    setStepData('patientId', patient.id);
    setStepData('employee', mapPatientAutofill(employee as AppointmentEmployeeForm, patient));
  };

  const { mutate: lookupPatientByCpfMutate } = useMutation({
    mutationFn: (cpf: string) => clientService.getPatientByCpf(cpf),
    onMutate: () => {
      setLookupState('searching');
      setLookupMessage('Buscando colaborador por CPF...');
    },
    onSuccess: (patient) => {
      if (!patient) {
        setStepData('patientId', null);
        setLookupState('not_found');
        setLookupMessage('CPF não encontrado. Continue preenchendo para novo cadastro.');
        return;
      }

      applyPatientAutofill(patient);
      setLookupState('found');
      setLookupMessage(`Colaborador encontrado: ${patient.name}. Dados preenchidos automaticamente.`);
    },
    onError: () => {
      setLookupState('error');
      setLookupMessage('Não foi possível consultar o CPF neste momento.');
    },
  });

  useEffect(() => {
    const normalizedCpf = digitsOnly(employee.cpf);

    if (normalizedCpf.length !== 11) {
      if (appointmentData.patientId !== null) {
        setStepData('patientId', null);
      }

      setLookupState('idle');
      setLookupMessage('');
      lastSearchedCpfRef.current = '';
      return;
    }

    if (!isValidCpf(normalizedCpf)) {
      if (appointmentData.patientId !== null) {
        setStepData('patientId', null);
      }

      setLookupState('idle');
      setLookupMessage('');
      return;
    }

    if (normalizedCpf === lastSearchedCpfRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastSearchedCpfRef.current = normalizedCpf;
      lookupPatientByCpfMutate(normalizedCpf);
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appointmentData.patientId, employee.cpf, lookupPatientByCpfMutate, setStepData]);

  const handleCpfChange = (value: string) => {
    const maskedCpf = cpfMask(value);
    updateEmployee('cpf', maskedCpf);

    if (appointmentData.patientId !== null) {
      setStepData('patientId', null);
    }
  };

  const validationErrors = useMemo(
    () => validateEmployee(employee),
    [employee],
  );

  const isFormValid = useMemo(
    () => Object.keys(validationErrors).length === 0,
    [validationErrors],
  );

  const handleContinue = () => {
    setShowFieldErrors(true);

    if (!isFormValid) {
      toast.error('Corrija os campos destacados para continuar.');
      return;
    }

    navigate('/certificate/type');
  };

  const inputErrorClass = 'border-red-500 focus-visible:ring-red-500';

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Etapa 2 de 4
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Dados do colaborador
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Informe os dados do colaborador para continuar a solicitação.
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
          <form className="w-full flex flex-col gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  CPF
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="000.000.000-00"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.cpf ? inputErrorClass : ''
                  }`}
                  value={employee.cpf}
                  onChange={(e) => handleCpfChange(e.target.value)}
                />
                {lookupState !== 'idle' && (
                  <p
                    className={`text-xs font-medium ${
                      lookupState === 'found'
                        ? 'text-emerald-600'
                        : lookupState === 'error'
                          ? 'text-red-600'
                          : 'text-slate-500'
                    }`}>
                    {lookupState === 'searching' && (
                      <Loader2 className="inline-block mr-1 h-3 w-3 animate-spin" />
                    )}
                    {lookupMessage}
                  </p>
                )}
                {showFieldErrors && validationErrors.cpf && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.cpf}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Nome completo
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Informe o nome completo"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.name ? inputErrorClass : ''
                  }`}
                  value={employee.name}
                  onChange={(e) => updateEmployee('name', e.target.value)}
                />
                {showFieldErrors && validationErrors.name && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.name}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  Identidade (RG)
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Informe o número da identidade"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.rg ? inputErrorClass : ''
                  }`}
                  value={employee.rg}
                  onChange={(e) => updateEmployee('rg', maskRGIE(e.target.value))}
                />
                {showFieldErrors && validationErrors.rg && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.rg}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Estado civil
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.maritalStatus}
                  onValueChange={(value) => updateEmployee('maritalStatus', value)}>
                  <SelectTrigger
                    className={`w-full rounded-xl ${
                      showFieldErrors && validationErrors.maritalStatus ? inputErrorClass : ''
                    }`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                    <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                    <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                    <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                    <SelectItem value="União Estável">União Estável</SelectItem>
                  </SelectContent>
                </Select>
                {showFieldErrors && validationErrors.maritalStatus && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.maritalStatus}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  Data de nascimento
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.birthDate ? inputErrorClass : ''
                  }`}
                  value={employee.birthDate}
                  onChange={(e) => updateEmployee('birthDate', e.target.value)}
                />
                {showFieldErrors && validationErrors.birthDate && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.birthDate}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Sexo
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.gender}
                  onValueChange={(value) => updateEmployee('gender', value)}>
                  <SelectTrigger
                    className={`w-full rounded-xl ${
                      showFieldErrors && validationErrors.gender ? inputErrorClass : ''
                    }`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {showFieldErrors && validationErrors.gender && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.gender}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  Função/Cargo
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.position_id ? String(employee.position_id) : ''}
                  onValueChange={(value) => updateEmployee('position_id', Number(value))}>
                  <SelectTrigger
                    className={`w-full rounded-xl ${
                      showFieldErrors && validationErrors.position_id ? inputErrorClass : ''
                    }`}>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position: { id: number; name: string }) => (
                      <SelectItem key={position.id} value={String(position.id)}>
                        {position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showFieldErrors && validationErrors.position_id && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.position_id}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Departamento/Setor
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.department_id ? String(employee.department_id) : ''}
                  onValueChange={(value) => updateEmployee('department_id', Number(value))}>
                  <SelectTrigger
                    className={`w-full rounded-xl ${
                      showFieldErrors && validationErrors.department_id ? inputErrorClass : ''
                    }`}>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department: { id: number; name: string }) => (
                      <SelectItem key={department.id} value={String(department.id)}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showFieldErrors && validationErrors.department_id && (
                  <p className="text-xs font-medium text-red-600">
                    {validationErrors.department_id}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>
                E-mail
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="Informe o e-mail"
                className={`w-full rounded-xl ${
                  showFieldErrors && validationErrors.email ? inputErrorClass : ''
                }`}
                value={employee.email}
                onChange={(e) => updateEmployee('email', e.target.value)}
              />
              {showFieldErrors && validationErrors.email && (
                <p className="text-xs font-medium text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  Telefone principal
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="(00) 00000-0000"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.phone ? inputErrorClass : ''
                  }`}
                  value={employee.phone}
                  onChange={(e) => updateEmployee('phone', phoneMask(e.target.value))}
                />
                {showFieldErrors && validationErrors.phone && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.phone}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Telefone auxiliar</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  className={`w-full rounded-xl ${
                    showFieldErrors && validationErrors.altPhone ? inputErrorClass : ''
                  }`}
                  value={employee.altPhone}
                  onChange={(e) => updateEmployee('altPhone', phoneMask(e.target.value))}
                />
                {showFieldErrors && validationErrors.altPhone && (
                  <p className="text-xs font-medium text-red-600">{validationErrors.altPhone}</p>
                )}
              </div>
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
                disabled={!isFormValid}
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
