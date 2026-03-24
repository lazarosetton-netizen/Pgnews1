/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback } from 'react';
import { fetchLatestNews, NewsItem } from './services/newsService';
import { RefreshCw, Globe, History, Shield, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLatestNews();
      if (data.length > 0) {
        setNews(data);
        setLastUpdated(new Date());
      } else {
        setError("Não foi possível carregar as notícias no momento. Tente novamente em instantes.");
      }
    } catch (err) {
      setError("Erro ao conectar com o serviço de notícias.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
    // Refresh every 10 minutes
    const interval = setInterval(loadNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNews]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-israel-blue text-white py-6 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full">
              <Shield className="text-israel-blue w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight">PGNEWS</h1>
              <p className="text-xs opacity-80 uppercase tracking-widest font-mono">Monitoramento Geopolítico e Histórico</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase opacity-60 font-mono">Última atualização</p>
                <p className="text-sm font-mono">{format(lastUpdated, "HH:mm:ss", { locale: ptBR })}</p>
              </div>
            )}
            <button 
              onClick={loadNews}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors disabled:opacity-50"
              title="Atualizar Notícias"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full p-4 md:p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading && news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-12 h-12 text-israel-blue animate-spin" />
            <p className="text-gray-500 font-mono animate-pulse">Buscando notícias em tempo real...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {news.map((item) => (
              <article key={item.id} className="news-card group pb-12">
                <div className="flex items-center gap-2 mb-4 text-[11px] font-mono text-gray-500 uppercase tracking-wider">
                  <span className="bg-gray-200 px-2 py-0.5 rounded">{item.source}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(item.timestamp), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight group-hover:text-israel-blue transition-colors">
                  {item.title}
                </h2>

                <div className="prose prose-slate max-w-none mb-8 text-gray-700 leading-relaxed">
                  <div className="markdown-body">
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                </div>

                <div className="pro-israel-box p-6 md:p-8 rounded-r-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-israel-blue">
                    <History className="w-5 h-5" />
                    <h3 className="font-bold uppercase text-sm tracking-widest">Perspectiva Geopolítica e Histórica</h3>
                  </div>
                  <div className="markdown-body text-sm md:text-base text-slate-800 italic">
                    <ReactMarkdown>{item.proIsraelPerspective}</ReactMarkdown>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-israel-blue transition-colors"
                  >
                    FONTE ORIGINAL <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center gap-6 mb-8">
            <Globe className="w-6 h-6 opacity-50" />
            <Shield className="w-6 h-6 opacity-50" />
            <History className="w-6 h-6 opacity-50" />
          </div>
          <p className="text-sm mb-2">PGNEWS &copy; {new Date().getFullYear()}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">
            Fatos • Lógica • Dados • História
          </p>
        </div>
      </footer>
    </div>
  );
}
