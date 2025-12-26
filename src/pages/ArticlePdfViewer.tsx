import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, ExternalLink } from 'lucide-react';
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
  const [viewIncremented, setViewIncremented] = useState(false);

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
          title: 'PDF could not be loaded',
          description: (error as any)?.message ?? 'Failed to create PDF link.',
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

  // Increment view count once when PDF is loaded
  useEffect(() => {
    if (!pdfSignedUrl || !articleId || viewIncremented) return;

    const increment = async () => {
      try {
        // Prefer atomic increment via RPC (cast avoids TS restriction until types include the function)
        await (supabase as any).rpc('increment_article_views', { article_id: articleId });
      } catch {
        // Ignore if function doesn't exist / blocked by policies
      } finally {
        setViewIncremented(true);
      }
    };

    increment();
  }, [pdfSignedUrl, articleId, viewIncremented]);

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

      // Increment download count
      if (articleId) {
        try {
          await (supabase as any).rpc('increment_article_downloads', { article_id: articleId });
        } catch {
          // Ignore if function doesn't exist / blocked by policies
        }
      }
    } catch {
      toast({
        title: 'Download failed',
        description: 'Error downloading PDF.',
        variant: 'destructive',
      });
    }
  };

  const openInNewTab = () => {
    if (pdfSignedUrl) {
      window.open(pdfSignedUrl, '_blank');
    }
  };

  if (isLoading || pdfLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-6 w-64 bg-muted animate-pulse rounded hidden sm:block" />
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article || !pdfSignedUrl) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">PDF Not Found</h1>
        <p className="text-muted-foreground mb-6">PDF is not available for this article.</p>
        <Link to={`/journal/${slug}/article/${articleId}`}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Article
          </Button>
        </Link>
      </div>
    );
  }

  // Use Google Docs viewer for reliable PDF embedding
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfSignedUrl)}&embedded=true`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Bar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <Link to={`/journal/${slug}/article/${articleId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Article
          </Button>
        </Link>
        
        <h1 className="text-sm font-medium text-foreground truncate flex-1 text-center hidden sm:block">
          {article.title}
        </h1>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={openInNewTab} title="Open in new tab">
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Full-screen PDF Viewer using Google Docs Viewer */}
      <div className="flex-1">
        <iframe
          src={googleViewerUrl}
          className="w-full h-full border-0"
          title="PDF Viewer"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ArticlePdfViewer;
