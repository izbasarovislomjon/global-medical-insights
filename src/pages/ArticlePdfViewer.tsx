import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

interface ArticleWithIssue {
  id: string;
  title: string;
  pdf_url: string | null;
  issues: {
    journals: {
      slug: string;
    };
  };
}

const useArticle = (articleId: string) => {
  return useQuery({
    queryKey: ['article-pdf', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          pdf_url,
          issues (
            journals (
              slug
            )
          )
        `)
        .eq('id', articleId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ArticleWithIssue | null;
    },
    enabled: !!articleId
  });
};

const ArticlePdfViewer = () => {
  const { articleId, slug } = useParams<{ articleId: string; slug: string }>();
  const { data: article, isLoading } = useArticle(articleId || '');
  const [pdfSignedUrl, setPdfSignedUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);

  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (!articleId) return;
      
      setPdfLoading(true);
      const { data, error } = await supabase.functions.invoke('article-pdf', {
        body: { articleId },
      });

      const url = (data as any)?.url as string | undefined;
      if (error || !url) {
        toast({
          title: 'PDF ochilmadi',
          description: (error as any)?.message ?? 'PDF link yaratib bo\'lmadi.',
          variant: 'destructive',
        });
        setPdfLoading(false);
        return;
      }

      setPdfSignedUrl(url);
      setPdfLoading(false);
    };

    fetchPdfUrl();
  }, [articleId]);

  const handleDownload = async () => {
    if (!pdfSignedUrl) return;

    try {
      const resp = await fetch(pdfSignedUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      const safeTitle = (article?.title || 'article')
        .replace(/[^a-z0-9\-_]+/gi, '_')
        .slice(0, 80);
      a.download = `${safeTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      toast({
        title: 'Yuklab bo\'lmadi',
        description: 'PDF yuklab olishda xatolik.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || pdfLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">PDF yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article || !pdfSignedUrl) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">PDF topilmadi</h1>
        <p className="text-muted-foreground mb-6">Bu maqola uchun PDF mavjud emas.</p>
        <Link to={`/journal/${slug}/article/${articleId}`}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Maqolaga qaytish
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Bar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <Link to={`/journal/${slug}/article/${articleId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Maqolaga qaytish
          </Button>
        </Link>
        
        <h1 className="text-sm font-medium text-foreground truncate flex-1 text-center hidden sm:block">
          {article.title}
        </h1>
        
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Yuklab olish
        </Button>
      </div>

      {/* Full-screen PDF Viewer */}
      <div className="flex-1">
        <iframe
          src={pdfSignedUrl}
          className="w-full h-full border-0"
          title="PDF Viewer"
        />
      </div>
    </div>
  );
};

export default ArticlePdfViewer;
