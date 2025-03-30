import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/views/components/ui/card';

const cards = [
  {
    title: 'Agendamentos',
    amount: 3,
    description: 'Solicitações em andamento',
    progress: 25,
    progressLabel: '+25% from last week',
    textColor: '#000',
    bgColor: 'bg-[#c7d7f0]',
    key: 'agendamento',
  },
  {
    title: 'Processados',
    amount: 5,
    description: "ASO's que não foram finalizados",
    textColor: '#dadada',
    bgColor: 'bg-[#5d90d3]',
    progress: 50,
    progressLabel: '+50% from last month',
    key: 'processados',
  },
  {
    title: 'Arquivados',
    amount: 2,
    description: "ASO's analizados e finalizados",
    textColor: '#dadada',
    bgColor: 'bg-[#2858a1]',
    progress: 75,
    progressLabel: '+75% from last quarter',
    key: 'arquivados',
  },
  {
    title: 'Totalidade',
    amount: 10,
    description: "Contagem completa dos ASO's",
    textColor: '#dadada',

    bgColor: 'bg-[#1f3d6d]',
    progress: 90,
    progressLabel: '+90% from last year',
    key: 'total',
  },
];

export function AsoCompliance() {
  return (
    <>
      {cards.map((card) => (
        <Card
          key={card.key}
          x-chunk={`dashboard-05-chunk-${card.key}`}
          className={`flex flex-col justify-center ${card.bgColor}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl" style={{ color: card.textColor }}>
              {card.amount}
            </CardTitle>
            <CardDescription style={{ color: card.textColor }}>
              {card.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="text-xs text-muted-foreground"
              style={{ color: card.textColor }}>
              {card.description}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
