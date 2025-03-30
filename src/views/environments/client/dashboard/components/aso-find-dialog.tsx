import { useEffect, useState } from 'react';

import { Button } from '@/views/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/views/components/ui/command';

import { Calendar, FileDashed, Gear, User } from '@phosphor-icons/react';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/views/components/ui/dialog';

export function AsoFindDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(!open)}>Procurar ASOs</Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="px-3 pt-4">
          <DialogTitle>Tem certeza?</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Ela excluirá permanentemente seu
            ASO e removerá seus dados de nossos servidores.
          </DialogDescription>
        </DialogHeader>

        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          <CommandGroup heading="Sugestões">
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendário</span>
            </CommandItem>

            <CommandItem>
              <FileDashed className="mr-2 h-4 w-4" />
              <span>ASOs Anteriores</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Configurações">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>

            <CommandItem>
              <Gear className="mr-2 h-4 w-4" />
              <span>Configurações</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
