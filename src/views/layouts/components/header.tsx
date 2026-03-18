import { clientService } from '@/app/services/client';
import { Button } from '@/views/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/views/components/ui/dropdown-menu';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/views/components/ui/menubar';
import { ArrowRight, Lightning } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink } from 'react-router-dom';
import { Out } from './out';

export function Header() {
  const { data: profile } = useQuery({
    queryKey: ['profileHeaderAvatar'],
    queryFn: clientService.verifyToken,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
  const avatarSrc = resolveAvatarUrl(profile?.img, profile?.id);

  return (
    <div className="sticky top-0 backdrop-blur-md bg-white/30 z-[99999999]">
      <header className="p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <img src="/grupo-ssma.png" className="w-32 mr-2" />

          <div className="flex items-center gap-4">
            <div className="w-fit h-fit flex items-center gap-2">
              <Button
                asChild
                variant="secondary"
                className="rounded-xl flex items-center justify-center gap-2">
                <NavLink to="/">
                  <p className="leading-3">Início</p>
                </NavLink>
              </Button>

              <Button asChild variant="ghost" className="rounded-xl">
                <NavLink to="/newsroom">
                  <Lightning size={20} />
                </NavLink>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="secondary"
            className="rounded-xl flex items-center gap-1">
            <Link to="/certificate">
              Solicitar atestado
              <ArrowRight className="w-4" />
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative !p-0">
                  <img
                    src={avatarSrc}
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_AVATAR_URL;
                    }}
                    alt=""
                    className="h-10 w-10 rounded-xl border-2"
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-48 z-[999999999]"
                align="end"
                forceMount>
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="https://wa.me/5579981291760?text=Ol%C3%A1%2C+Preciso+de+ajuda+com%3A+"
                    target="_blank">
                    Suporte Técnico
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Out />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Menubar className="px-2">
        <MenubarMenu>
          <MenubarTrigger>Atestados</MenubarTrigger>
          <MenubarContent>
            <MenubarItem asChild>
              <NavLink
                className="active:scale-95 aria-[current=page]:bg-primary aria-[current=page]:text-white cursor-pointer transition-all"
                to="/certificates">
                Gerênciar
              </NavLink>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}

const API_ORIGIN = 'https://ssma-gestor.fluxosistemas.com.br';
const DEFAULT_AVATAR_URL = 'https://avatars.githubusercontent.com/u/69989490?v=4';

function resolveAvatarUrl(img?: string | null, clientId?: number | string): string {
  if (!img || img === 'null') return DEFAULT_AVATAR_URL;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('blob:') || img.startsWith('data:')) return img;

  const normalized = img.replace(/^\/+/, '');

  if (normalized.includes('/')) {
    return `${API_ORIGIN}/${normalized}`;
  }

  if (clientId) {
    return `${API_ORIGIN}/storage/clients/client_${clientId}/${normalized}`;
  }

  return `${API_ORIGIN}/${normalized}`;
}
