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

          <form className="w-full flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="w-full flex flex-col gap-2">
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

              <div className="w-full flex flex-col gap-2">
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

            <div className="w-full flex flex-col gap-2">
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

            <div className="flex gap-4">
              <div className="w-full flex flex-col gap-2">
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

              <div className="w-full flex flex-col gap-2">
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

            <div className="flex gap-4">
              <div className="w-full flex flex-col gap-2">
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

              <div className="w-full flex flex-col gap-2">
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

            <div className="w-full flex flex-col gap-2">
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

            <div className="flex gap-4">
              <div className="w-full flex flex-col gap-2">
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

              <div className="w-full flex flex-col gap-2">
                <Label>Telefone auxiliar</Label>
                <Input
                  placeholder="00 0 0000-0000"
                  className="w-full rounded-xl"
                  value={employee.altPhone}
                  onChange={(e) => handleChange('altPhone', e.target.value)}
                />
              </div>
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
                disabled={!isFormValid}
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
