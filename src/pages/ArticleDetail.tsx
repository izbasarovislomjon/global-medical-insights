import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, Calendar, Download, FileText, 
  ArrowLeft, Eye, Copy, ExternalLink, User
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ArticleWithIssue {
  id: string;
  title: string;
  abstract: string | null;
  keywords: string[] | null;
  authors: { name: string; affiliation?: string; email?: string }[];
  pdf_url: string | null;
  doi: string | null;
  pages: string | null;
  published_at: string;
  views: number;
  downloads: number;
  issue_id: string;
  issues: {
    volume: number;
    issue_number: number;
    year: number;
    month: string | null;
    journal_id: string;
    journals: {
      title: string;
      slug: string;
      issn: string;
    };
  };
}

const useArticle = (articleId: string) => {
  return useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          issues (
            volume,
            issue_number,
            year,
            month,
            journal_id,
            journals (
              title,
              slug,
              issn
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

const ArticleDetail = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { data: article, isLoading } = useArticle(articleId || '');
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const getPdfUrl = async () => {
    if (!articleId) return null;
    if (!article?.pdf_url) {
      toast({
        title: 'PDF mavjud emas',
        description: 'Bu maqola uchun PDF yuklanmagan.',
        variant: 'destructive',
      });
      return null;
    }

    if (pdfUrl) return pdfUrl;

    setPdfLoading(true);
    const { data, error } = await supabase.functions.invoke('article-pdf', {
      body: { articleId },
    });
    setPdfLoading(false);

    const url = (data as any)?.url as string | undefined;
    if (error || !url) {
      toast({
        title: 'PDF ochilmadi',
        description: (error as any)?.message ?? 'PDF link yaratib bo\'lmadi.',
        variant: 'destructive',
      });
      return null;
    }

    setPdfUrl(url);
    return url;
  };

  const handleReadOnline = async () => {
    const url = await getPdfUrl();
    if (!url) return;
    setShowPdfViewer(true);
  };

  const handleDownload = async () => {
    // Open immediately to avoid popup blockers
    const newTab = window.open('', '_blank');
    const url = await getPdfUrl();
    if (!url) {
      newTab?.close();
      return;
    }

    if (newTab) newTab.location.href = url;
    else window.location.assign(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Citation copied to clipboard.',
    });
  };

  const generateCitation = () => {
    if (!article) return '';
    const authors = article.authors.map(a => a.name).join(', ');
    const year = new Date(article.published_at).getFullYear();
    const journal = article.issues?.journals?.title || 'Journal';
    const volume = article.issues?.volume;
    const issue = article.issues?.issue_number;
    const pages = article.pages || '';
    return `${authors}. (${year}). ${article.title}. ${journal}, ${volume}(${issue}), ${pages}.`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const journal = article.issues?.journals;
  const issue = article.issues;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            {journal && (
              <>
                <Link to={`/journal/${journal.slug}`} className="hover:text-primary">{journal.title}</Link>
                <span>/</span>
              </>
            )}
            {issue && (
              <>
                <span>Vol. {issue.volume} No. {issue.issue_number} ({issue.year})</span>
                <span>/</span>
              </>
            )}
            <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Back Button */}
            {journal && (
              <Link to={`/journal/${journal.slug}`}>
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {journal.title}
                </Button>
              </Link>
            )}

            {/* Article Title */}
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-tight mb-4">
                {article.title}
              </h1>
            </div>

            {/* Authors */}
            <div className="space-y-2">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Authors
              </h2>
              <div className="space-y-2">
                {article.authors.map((author, idx) => (
                  <div key={idx} className="text-muted-foreground">
                    <span className="font-medium text-foreground">{author.name}</span>
                    {author.affiliation && (
                      <span className="text-sm ml-2">— {author.affiliation}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords */}
            {article.keywords && article.keywords.length > 0 && (
              <div>
                <h2 className="font-semibold text-foreground mb-2">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Abstract */}
            {article.abstract && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-foreground mb-3">Abstract</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {article.abstract}
                </p>
              </div>
            )}

            {/* PDF Viewer */}
            {showPdfViewer && (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">Full Text (PDF)</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowPdfViewer(false)}>
                    Close
                  </Button>
                </div>

                {pdfLoading ? (
                  <div className="p-6">
                    <Skeleton className="h-6 w-48 mb-3" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[600px]"
                    title="PDF Viewer"
                  />
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">
                    PDF link topilmadi.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Downloads */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Downloads
              </h3>
              {article.pdf_url ? (
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleReadOnline} disabled={pdfLoading}>
                    <Eye className="w-4 h-4 mr-2" />
                    Read Online (PDF)
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleDownload} disabled={pdfLoading}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">PDF not available</p>
              )}
            </div>

            {/* Publication Info */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-heading font-bold text-foreground mb-4">Publication Info</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Published</dt>
                  <dd className="font-medium text-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
                {issue && (
                  <div>
                    <dt className="text-muted-foreground">Issue</dt>
                    <dd className="font-medium text-foreground">
                      Vol. {issue.volume} No. {issue.issue_number} ({issue.year})
                    </dd>
                  </div>
                )}
                {article.pages && (
                  <div>
                    <dt className="text-muted-foreground">Pages</dt>
                    <dd className="font-medium text-foreground">{article.pages}</dd>
                  </div>
                )}
                {article.doi && (
                  <div>
                    <dt className="text-muted-foreground">DOI</dt>
                    <dd className="font-medium text-primary break-all">
                      <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        {article.doi}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </dd>
                  </div>
                )}
                <div className="flex gap-4 pt-2">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    {article.views} views
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Download className="w-4 h-4" />
                    {article.downloads} downloads
                  </span>
                </div>
              </dl>
            </div>

            {/* How to Cite */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-heading font-bold text-foreground mb-4">How to Cite</h3>
              <div className="bg-muted/50 rounded p-3 text-sm text-muted-foreground mb-3">
                {generateCitation()}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => copyToClipboard(generateCitation())}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Citation
              </Button>
            </div>

            {/* License */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-heading font-bold text-foreground mb-4">License</h3>
              <a 
                href="https://creativecommons.org/licenses/by-nc-nd/4.0/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <img 
                  src="https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" 
                  alt="Creative Commons License"
                  className="h-6"
                />
                <span>CC BY-NC-ND 4.0</span>
              </a>
            </div>

            {/* Journal Info */}
            {journal && (
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-5 text-primary-foreground">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-8 h-8" />
                  <div>
                    <h3 className="font-heading font-bold">{journal.title}</h3>
                    <p className="text-xs text-primary-foreground/70">ISSN: {journal.issn}</p>
                  </div>
                </div>
                <Link to={`/journal/${journal.slug}`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    View Journal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetail;
