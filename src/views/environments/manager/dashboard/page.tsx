import { useQuery } from '@tanstack/react-query';
import {
  Users,
  ClipboardText,
  UserList,
  TrendUp,
  DotsThreeVertical,
  PlusCircle,
  FileArrowUp,
  UserPlus,
  FileText,
} from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/views/components/ui/card';
import { Button } from '@/views/components/ui/button';
import { managerService } from '@/app/services/manager';
import { Skeleton } from '@/views/components/ui/skeleton';

const iconMap = {
  Users: Users,
  ClipboardText: ClipboardText,
  UserList: UserList,
  TrendUp: TrendUp,
};

const quickActions = [
  { name: 'Cadastrar Empresa', icon: PlusCircle, href: '/manager/clients/new' },
  { name: 'Admitir Paciente', icon: UserPlus, href: '/manager/patients/new' },
  { name: 'Upload de Resultado', icon: FileArrowUp, href: '/manager/results/upload' },
];

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'summary'],
    queryFn: managerService.getSummary,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium">Bem-vindo ao painel administrativo do SSMA Gestor.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm bg-white overflow-hidden p-6">
               <div className="flex items-center justify-between">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-12" />
                  </div>
               </div>
            </Card>
          ))
        ) : (
          data?.stats.map((stat) => {
            const Icon = iconMap[stat.icon as keyof typeof iconMap] || ClipboardText;
            return (
              <Card key={stat.name} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={stat.color + " p-3 rounded-2xl text-white shadow-lg shadow-inner group-hover:scale-110 transition-transform duration-500"}>
                      <Icon size={24} weight="duotone" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.name}</span>
                      <span className="text-2xl font-black text-slate-900 mt-1">{stat.value}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {stat.trend}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">desde o último mês</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Atividade Recente</CardTitle>
              <CardDescription>Ultimos resultados processados no sistema.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl">
               <DotsThreeVertical size={20} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                data?.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <FileText size={20} weight="duotone" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{activity.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{activity.time}</span>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full rounded-xl mt-4 border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                Ver Todo Histórico
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & System Health */}
        <div className="space-y-8">
           <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {quickActions.map((action) => (
                  <Button key={action.name} variant="secondary" className="justify-start gap-3 bg-white/10 hover:bg-white/20 border-white/5 text-white rounded-xl h-12 font-bold transition-all">
                    <action.icon size={20} weight="duotone" />
                    {action.name}
                  </Button>
                ))}
              </CardContent>
              {/* Abstract decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
           </Card>

           <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">API Gateway</span>
                  <span className="text-emerald-500">Operacional</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">File Storage (AWS)</span>
                  <span className="text-emerald-500">Operacional</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">Banco de Dados</span>
                  <span className="text-emerald-500">Operacional</span>
                </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
