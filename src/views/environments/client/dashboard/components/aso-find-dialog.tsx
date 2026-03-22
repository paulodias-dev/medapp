import { Button } from '@/views/components/ui/button';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export function AsoFindDialog() {
  return (
    <Button
      asChild
      className="rounded-xl h-10 gap-2 font-bold bg-blue-600 hover:bg-blue-700"
    >
      <Link to="/certificates?focus=search">
        <MagnifyingGlass size={16} weight="bold" />
        Procurar ASOs
      </Link>
    </Button>
  );
}
