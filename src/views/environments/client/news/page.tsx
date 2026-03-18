import { endOfDay, format } from 'date-fns';
import { BookmarkSimple, ShareNetwork } from '@phosphor-icons/react';

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
  const currentDate = format(new Date(), 'dd/MM/yyyy');

  return (
    <div className="pb-10">
      <div className="animate-slidein200 opacity-0 flex items-end justify-start gap-2 py-8 px-4 pb-6 border-b bg-white">
        <h1 className="text-3xl font-bold text-zinc-800">Novidades</h1>
        <p className="text-sm text-zinc-400 mb-1">
          {currentDate}
        </p>
      </div>

      <hr className="border-b-[10px] border-[#f5f5f5]" />

      <div className="px-4 py-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {NEWS_DATA.map((news) => (
          <div
            key={news.id}
            className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-zinc-600 border border-white/20 shadow-sm">
                  {news.category}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3 text-xs text-zinc-400">
                <span>{format(news.date, 'dd MMM, yyyy')}</span>
                <div className="flex gap-2 text-zinc-500">
                  <button className="hover:text-primary transition-colors">
                    <BookmarkSimple size={18} />
                  </button>
                  <button className="hover:text-primary transition-colors">
                    <ShareNetwork size={18} />
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-zinc-800 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {news.title}
              </h2>

              <p className="text-zinc-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                {news.description}
              </p>

              <button className="w-full py-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-semibold rounded-2xl transition-all duration-300 border border-zinc-100 flex items-center justify-center gap-2">
                Ler mais
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
