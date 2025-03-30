import { Button } from '@/views/components/ui/button';
import { ScrollArea } from '@/views/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/views/components/ui/sheet';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/views/components/ui/avatar';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/views/components/ui/tabs';

import { Badge } from '@/views/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/views/components/ui/select';
import { Separator } from '@/views/components/ui/separator';
import { Clock, File } from '@phosphor-icons/react';
import { Eye } from 'lucide-react';

export function Manage() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Open
        </Button>
      </SheetTrigger>
      <SheetContent className="!w-[600px] !max-w-[600px] z-[999999999] rounded-2xl flex flex-col gap-6 overflow-y-auto">
        <header className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-400">
              Atestado de Saúde Ocupacional
            </p>
            <h1 className="font-medium">#22637182</h1>
          </div>

          <Separator orientation="vertical" />

          <Badge>Periodico</Badge>
        </header>

        <div className="border rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/GuilhermeSantosUI.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div>
              <p className="text-xs text-gray-400">Nome do paciente:</p>
              <h1>Guilherme Santos</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-400">Status:</p>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder="Selecione o status"
                  defaultValue="teste"
                />
              </SelectTrigger>
              <SelectContent className="z-[9999999999]">
                <SelectGroup>
                  <SelectItem
                    value="teste"
                    className="relative"
                    color="bg-green-600">
                    Sem alteração
                  </SelectItem>
                  <SelectItem
                    value="apple"
                    className="relative"
                    color="bg-gray-600">
                    Em andamento
                  </SelectItem>
                  <SelectItem
                    value="banana"
                    className="relative"
                    color="bg-red-600">
                    Alterado
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 rounded-2xl bg-blue-50 p-4">
          <Clock className="w-6 h-6 fill-blue-600" />
          <p className="text-blue-400 text-sm">
            Horário disponível no futuro, você pode estender o tempo de reserva.
          </p>
        </div>

        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Informações Gerais</TabsTrigger>
            <TabsTrigger value="password">Arquivos</TabsTrigger>
          </TabsList>

          <Separator className="my-4" />

          <TabsContent value="account">
            <h1>Informações Gerais</h1>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">
                    Nome completo:
                  </p>
                  <h1>Teste teste teste teste</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">Sexo:</p>
                  <h1>Masculino</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">
                    Data de nascimento:
                  </p>
                  <h1>31/12/1969</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">CPF:</p>
                  <h1>000.000.000-00</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">RG:</p>
                  <h1>00.000.000-0</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">
                    Estado Civil:
                  </p>
                  <h1>Solteiro</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">Número:</p>
                  <h1>123</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">Bairro:</p>
                  <h1>Teste Bairro</h1>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">Telefone:</p>
                  <h1>(00) 00000-0000</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">E-Mail:</p>
                  <h1>teste@teste.com</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">Telefone:</p>
                  <h1>(00) 00000-0000</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">Logradouro:</p>
                  <h1>Rua Teste</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">
                    Complemento:
                  </p>
                  <h1>Apto 00</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">Cidade:</p>
                  <h1>Teste City</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">Estado:</p>
                  <h1>Teste State</h1>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase">CEP:</p>
                  <h1>00000-000</h1>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="password">
            <ScrollArea className="h-max space-y-4">
              <div className="rounded-2xl border px-2 py-3 flex items-center gap-4 relative">
                <div className="border rounded-xl relative p-2">
                  <File className="w-6 h-6" />
                  <div className="absolute left-2 bottom-2 w-3 h-3 rounded-full bg-green-600"></div>
                </div>

                <div>
                  <p className="text-sm">
                    nome_do_arquivo_atestado_22637182.pdf
                  </p>
                  <p className="text-xs">1.2 MB</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 my-auto right-4">
                  <Eye className="w-5 h-5" />
                </Button>
              </div>

              <div className="rounded-2xl border px-2 py-3 flex items-center gap-4 relative mt-4">
                <div className="border rounded-xl relative p-2">
                  <File className="w-6 h-6" />
                  <div className="absolute left-2 bottom-2 w-3 h-3 rounded-full bg-green-600"></div>
                </div>

                <div>
                  <p className="text-sm">
                    nome_do_arquivo_atestado_22637182.pdf
                  </p>
                  <p className="text-xs">1.2 MB</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 my-auto right-4">
                  <Eye className="w-5 h-5" />
                </Button>
              </div>

              <div className="rounded-2xl border px-2 py-3 flex items-center gap-4 relative mt-4">
                <div className="border rounded-xl relative p-2">
                  <File className="w-6 h-6" />
                  <div className="absolute left-2 bottom-2 w-3 h-3 rounded-full bg-yellow-600"></div>
                </div>

                <div>
                  <p className="text-sm">
                    nome_do_arquivo_atestado_22637182.pdf
                  </p>
                  <p className="text-xs">1.2 MB</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 my-auto right-4">
                  <Eye className="w-5 h-5" />
                </Button>
              </div>

              <div className="rounded-2xl border px-2 py-3 flex items-center gap-4 relative mt-4">
                <div className="border rounded-xl relative p-2">
                  <File className="w-6 h-6" />
                  <div className="absolute left-2 bottom-2 w-3 h-3 rounded-full bg-green-600"></div>
                </div>

                <div>
                  <p className="text-sm">
                    nome_do_arquivo_atestado_22637182.pdf
                  </p>
                  <p className="text-xs">1.2 MB</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 my-auto right-4">
                  <Eye className="w-5 h-5" />
                </Button>
              </div>

              <div className="rounded-2xl border px-2 py-3 flex items-center gap-4 relative mt-4">
                <div className="border rounded-xl relative p-2">
                  <File className="w-6 h-6" />
                  <div className="absolute left-2 bottom-2 w-3 h-3 rounded-full bg-red-600"></div>
                </div>

                <div>
                  <p className="text-sm">
                    nome_do_arquivo_atestado_22637182.pdf
                  </p>
                  <p className="text-xs">1.2 MB</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 my-auto right-4">
                  <Eye className="w-5 h-5" />
                </Button>
              </div>

              <div className="rounded-2xl border px-2 py-3 flex items-center gap-4 relative mt-4">
                <div className="border rounded-xl relative p-2">
                  <File className="w-6 h-6" />
                  <div className="absolute left-2 bottom-2 w-3 h-3 rounded-full bg-red-600"></div>
                </div>

                <div>
                  <p className="text-sm">
                    nome_do_arquivo_atestado_22637182.pdf
                  </p>
                  <p className="text-xs">1.2 MB</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 my-auto right-4">
                  <Eye className="w-5 h-5" />
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
