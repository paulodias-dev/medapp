import { Button } from '@/views/components/ui/button';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <div className="w-full border-t border-slate-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {new Date().getFullYear()} by{' '}
          <Link to="" target="_blank" className="hover:underline">
            Start Corp Tecnologia &copy;
          </Link>
        </p>

        <div className="flex items-center gap-3">
          <Link to="" className="text-xs text-slate-500 hover:underline">
            Termos e Condições
          </Link>

          <Button size="sm" variant="outline" asChild className="rounded-xl">
            <Link
              to="https://wa.me/5579981291760?text=Ol%C3%A1%2C+Preciso+de+ajuda+com%3A+"
              target="_blank">
              Suporte Técnico
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
