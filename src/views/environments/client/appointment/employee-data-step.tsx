import { Button } from '@/views/components/ui/button';
import { Input } from '@/views/components/ui/input';
import { Label } from '@/views/components/ui/label';
import { Newspaper } from '@phosphor-icons/react';
import { ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function EmployeeDataStep() {
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
            <div className="flex gap-4">
              <div className="w-full flex flex-col gap-2">
                <Label>
                  CPF
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Informe o CPF"
                  className="w-full rounded-xl"
                />
              </div>

              <div className="w-full flex flex-col gap-2">
                <Label>
                  Estado civil
                  <span className="text-red-500">*</span>
                </Label>
                <Input placeholder="Selecione" className="w-full rounded-xl" />
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label>
                Identidade
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Informe o número da sua identidade"
                className="w-full rounded-xl"
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
                  placeholder="Informe o nome da rua, avenida, etc."
                  className="w-full rounded-xl"
                />
              </div>

              <div className="w-full flex flex-col gap-2">
                <Label>
                  Sexo
                  <span className="text-red-500">*</span>
                </Label>
                <Input placeholder="Selecione" className="w-full rounded-xl" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-full flex flex-col gap-2">
                <Label>
                  Função/Cargo
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Local onde você nasceu"
                  className="w-full rounded-xl"
                />
              </div>

              <div className="w-full flex flex-col gap-2">
                <Label>
                  Departamento/Setor
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ex: Brasileira"
                  className="w-full rounded-xl"
                />
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
                />
              </div>

              <div className="w-full flex flex-col gap-2">
                <Label>
                  Telefone auxiliar
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="00 0 0000-0000"
                  className="w-full rounded-xl"
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
