import { Button } from '@/views/components/ui/button';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <div className="container flex items-center justify-between pb-6">
      <p className="text-xs">
        {new Date().getFullYear()} by{' '}
        <Link to="" target="_blank" className='hover:underline'>
          Start Corp Tecnologia &copy;
        </Link>
      </p>

      <div className="flex items-center justify-center gap-4">
        <Link to="" className="text-xs hover:underline">
          Termos e Condições
        </Link>

        <Button size="sm" variant="outline" asChild>
          <Link
            to="https://wa.me/5579981291760?text=Ol%C3%A1%2C+Preciso+de+ajuda+com%3A+"
            target="_blank">
            Suporte Técnico
          </Link>
        </Button>
      </div>
    </div>
  );
}
