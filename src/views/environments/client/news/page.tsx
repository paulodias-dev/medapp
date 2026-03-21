import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShareNetwork, ArrowRight } from '@phosphor-icons/react';
import { Skeleton } from '@/views/components/ui/skeleton';
import { Button } from '@/views/components/ui/button';
import { useEffect, useState } from 'react';

const NEWS_DATA = [
  {
    id: 1,
    title: 'Novo App do Grupo SSMA disponível!',
    category: 'Tecnologia',
    description: 'Agora você pode gerenciar seus atestados e agendamentos diretamente do seu smartphone com o novo aplicativo do Grupo SSMA. Mais praticidade para o seu dia a dia.',
    image: '/news_app_launch.png',
    date: new Date(),
  },
  {
    id: 2,
    title: 'A importância do ASO na sua carreira',
    category: 'Saúde Ocupacional',
    description: 'O Atestado de Saúde Ocupacional não é apenas um documento obrigatório, mas uma garantia de que você está apto e seguro para realizar suas funções.',
    image: '/occupational_health_aso.png',
    date: new Date(),
  },
  {
    id: 3,
    title: 'Dicas para Bem-Estar no Trabalho',
    category: 'Qualidade de Vida',
    description: 'Pequenas pausas e uma ergonomia adequada podem transformar sua produtividade e saúde a longo prazo. Confira nossas recomendações para o seu escritório.',
    image: '/workspace_wellness.png',
    date: new Date(),
  },
];

export function News() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const currentDate = format(new Date(), "dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="pb-20 bg-slate-50/50 min-h-screen">
      <div className="bg-white border-b border-slate-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Novidades</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Atualizado em {currentDate}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-bold border border-blue-100 shadow-sm">
              Informativo Mensal
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
          ))
        ) : (
          NEWS_DATA.map((news, index) => (
            <article
              key={news.id}
              style={{ animationDelay: `${index * 150}ms` }}
              className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute top-5 left-5">
                  <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-2xl text-[10px] font-bold text-slate-700 border border-white/20 shadow-xl uppercase tracking-widest">
                    {news.category}
                  </span>
                </div>

                <div className="absolute bottom-5 right-5 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                   <button className="bg-white text-slate-900 p-3 rounded-full shadow-2xl hover:bg-blue-600 hover:text-white transition-all scale-90 group-hover:scale-100">
                      <ShareNetwork size={20} weight="bold" />
                   </button>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-0 group-hover:w-full transition-all duration-700 ease-out" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {format(news.date, 'dd MMM, yyyy', { locale: ptBR })}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-850 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                  {news.title}
                </h2>

                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-3">
                  {news.description}
                </p>

                <button className="group/btn relative w-full py-4 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white font-bold rounded-2xl transition-all duration-300 border border-slate-100 flex items-center justify-center gap-2 overflow-hidden shadow-inner hover:shadow-blue-500/20">
                  <span className="relative z-10 flex items-center gap-2">
                    Ler matéria completa
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" weight="bold" />
                  </span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-3xl font-bold">Mantenha-se informado</h3>
                <p className="text-blue-100 max-w-md">
                  Receba avisos sobre novos treinamentos, prazos de exames e atualizações regulatórias diretamente no seu e-mail.
                </p>
              </div>
              <Button size="lg" variant="secondary" className="rounded-2xl px-10 h-16 text-lg font-bold shadow-xl active:scale-95 transition-transform">
                Assinar Newsletter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
