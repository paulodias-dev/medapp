import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/views/components/ui/card';

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
      description: 'Registros no período consultado',
      textColor: '#0f172a',
      bgColor: 'bg-[#dbeafe]',
      key: 'total',
    },
    {
      title: 'ASOs Aprovados',
      amount: activeAsos,
      description: 'Registros com status aprovado',
      textColor: '#e2e8f0',
      bgColor: 'bg-[#1d4ed8]',
      key: 'public',
    },
    {
      title: 'Com Alteração',
      amount: warningAsos,
      description: "ASO's com warning identificado",
      textColor: '#e2e8f0',
      bgColor: 'bg-[#1e3a8a]',
      key: 'warning',
    },
    {
      title: 'Pacientes Impactados',
      amount: impactedPatients,
      description: 'Pacientes distintos com alteração',
      textColor: '#e2e8f0',
      bgColor: 'bg-[#1e293b]',
      key: 'patients',
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <Card
          key={card.key}
          x-chunk={`dashboard-05-chunk-${card.key}`}
          className={`flex flex-col justify-center ${card.bgColor}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl" style={{ color: card.textColor }}>
              {isLoading ? '...' : card.amount}
            </CardTitle>
            <CardDescription style={{ color: card.textColor }}>
              {card.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="text-xs text-muted-foreground"
              style={{ color: card.textColor }}>
              {hasError
                ? 'Não foi possível carregar os indicadores.'
                : card.description}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
