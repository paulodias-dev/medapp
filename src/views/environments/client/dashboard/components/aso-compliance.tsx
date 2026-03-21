import {
  Card,
  CardContent,
  CardHeader,
} from '@/views/components/ui/card';
import { cn } from '@/app/utils';

type AsoComplianceProps = {
  totalAsos: number;
  activeAsos: number;
  warningAsos: number;
  impactedPatients: number;
  isLoading?: boolean;
  hasError?: boolean;
};

export function AsoCompliance({
  totalAsos,
  activeAsos,
  warningAsos,
  impactedPatients,
  isLoading,
  hasError,
}: AsoComplianceProps) {
  const cards = [
    {
      title: 'Total de ASOs',
      amount: totalAsos,
      description: 'Registros no período',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      amountColor: 'text-blue-700',
      labelColor: 'text-blue-600',
      descColor: 'text-blue-400',
      key: 'total',
    },
    {
      title: 'ASOs Aprovados',
      amount: activeAsos,
      description: 'Status aprovado',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      amountColor: 'text-emerald-700',
      labelColor: 'text-emerald-600',
      descColor: 'text-emerald-400',
      key: 'active',
    },
    {
      title: 'Com Alteração',
      amount: warningAsos,
      description: 'Requerem atenção',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      amountColor: 'text-amber-700',
      labelColor: 'text-amber-600',
      descColor: 'text-amber-400',
      key: 'warning',
    },
    {
      title: 'Pacientes Afetados',
      amount: impactedPatients,
      description: 'Colaboradores distintos',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      amountColor: 'text-slate-700',
      labelColor: 'text-slate-600',
      descColor: 'text-slate-400',
      key: 'patients',
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <Card
          key={card.key}
          className={cn(
            'flex flex-col justify-center shadow-sm',
            card.bg,
            card.border,
          )}>
          <CardHeader className="pb-1 pt-5">
            <p className={cn('text-xs font-bold uppercase tracking-widest', card.labelColor)}>
              {card.title}
            </p>
          </CardHeader>
          <CardContent className="pb-5">
            <p className={cn('text-4xl font-black tracking-tight', card.amountColor)}>
              {isLoading ? (
                <span className="animate-pulse">—</span>
              ) : hasError ? (
                <span className="text-2xl">!</span>
              ) : (
                card.amount
              )}
            </p>
            <p className={cn('mt-1 text-xs font-semibold', card.descColor)}>
              {hasError ? 'Erro ao carregar' : card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

