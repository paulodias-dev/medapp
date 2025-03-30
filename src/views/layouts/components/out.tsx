import { useAuth } from '@/app/context/use-auth';
import { Button } from '@/views/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/views/components/ui/dialog';
import { CaretCircleDoubleDown, SignOut } from '@phosphor-icons/react';

export function Out() {
  const { signOut } = useAuth();

  return (
    <Dialog>
      <DialogTrigger className="rounded-xl w-full">
        <Button
          variant="ghost"
          className="w-full font-normal justify-start"
          size="sm">
          Sair
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-[350px] !rounded-3xl flex flex-col text-center gap-2">
        <h1 className="text-xl font-bold">Sair da aplicação?</h1>
        <p className="text-gray-400">
          Tem certeza que deseja sair da aplicação?
        </p>

        <div className="flex gap-2 mt-4">
          <DialogClose asChild>
            <Button className="w-full h-[180px] rounded-xl flex flex-col gap-2">
              <CaretCircleDoubleDown className="w-8 h-8" />
              Continuar
            </Button>
          </DialogClose>

          <Button
            variant="outline"
            onClick={signOut}
            className="w-full h-[180px] rounded-xl flex flex-col gap-2">
            <SignOut className="w-8 h-8" />
            Sair
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
