import { useState, useMemo } from 'react';
import { useAllArticles } from './useJournals';

export const useArticleSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: articles, isLoading } = useAllArticles();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !articles) return [];

    const query = searchQuery.toLowerCase();
    
    return articles.filter((article: any) => {
      const titleMatch = article.title?.toLowerCase().includes(query);
      const abstractMatch = article.abstract?.toLowerCase().includes(query);
      const keywordsMatch = article.keywords?.some((k: string) => k.toLowerCase().includes(query));
      const authorsMatch = article.authors?.some((a: any) => a.name?.toLowerCase().includes(query));
      
      return titleMatch || abstractMatch || keywordsMatch || authorsMatch;
    }).slice(0, 10); // Limit to 10 results
  }, [searchQuery, articles]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading
  };
};
