import { useAppointment } from '@/app/context/appointment-context';
import { clientService } from '@/app/services/client';
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
import { useQuery } from '@tanstack/react-query';
import { Newspaper } from '@phosphor-icons/react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function EmployeeDataStep() {
  const navigate = useNavigate();
  const { data: appointmentData, setStepData } = useAppointment();
  const employee = appointmentData.employee;

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: clientService.masterData.getDepartments,
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: clientService.masterData.getPositions,
  });

  const handleChange = (field: keyof typeof employee, value: string | number | null) => {
    setStepData('employee', { ...employee, [field]: value });
  };

  const isFormValid =
    employee.cpf.trim() !== '' &&
    employee.rg.trim() !== '' &&
    employee.birthDate !== '' &&
    employee.gender !== '' &&
    employee.maritalStatus !== '' &&
    employee.position_id !== null &&
    employee.department_id !== null &&
    employee.email.trim() !== '' &&
    employee.phone.trim() !== '';

  const handleContinue = () => {
    if (!isFormValid) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    navigate('/certificate/type');
  };

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
                  placeholder="Informe o CPF"
                  className="w-full rounded-xl"
                  value={employee.cpf}
                  onChange={(e) => handleChange('cpf', e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Estado civil
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.maritalStatus}
                  onValueChange={(v) => handleChange('maritalStatus', v)}>
                  <SelectTrigger className="w-full rounded-xl">
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
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>
                Identidade (RG)
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Informe o número da identidade"
                className="w-full rounded-xl"
                value={employee.rg}
                onChange={(e) => handleChange('rg', e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  Data de nascimento
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  className="w-full rounded-xl"
                  value={employee.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Sexo
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.gender}
                  onValueChange={(v) => handleChange('gender', v)}>
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
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
                  onValueChange={(v) => handleChange('position_id', Number(v))}>
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos: { id: number; name: string }) => (
                      <SelectItem key={pos.id} value={String(pos.id)}>
                        {pos.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Departamento/Setor
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employee.department_id ? String(employee.department_id) : ''}
                  onValueChange={(v) => handleChange('department_id', Number(v))}>
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dep: { id: number; name: string }) => (
                      <SelectItem key={dep.id} value={String(dep.id)}>
                        {dep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                className="w-full rounded-xl"
                value={employee.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>
                  Telefone principal
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="00 0 0000-0000"
                  className="w-full rounded-xl"
                  value={employee.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Telefone auxiliar</Label>
                <Input
                  placeholder="00 0 0000-0000"
                  className="w-full rounded-xl"
                  value={employee.altPhone}
                  onChange={(e) => handleChange('altPhone', e.target.value)}
                />
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
