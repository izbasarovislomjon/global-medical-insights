import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Calendar, Download, FileText, 
  ArrowLeft, Eye, Copy, ExternalLink, User, Check
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
  const { articleId, slug } = useParams<{ articleId: string; slug: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading } = useArticle(articleId || '');
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleReadOnline = () => {
    // Navigate to dedicated PDF viewer page
    navigate(`/journal/${slug}/article/${articleId}/pdf`);
  };

  const handleDownload = async () => {
    if (!articleId || !article?.pdf_url) {
      toast({
        title: 'PDF mavjud emas',
        description: 'Bu maqola uchun PDF yuklanmagan.',
        variant: 'destructive',
      });
      return;
    }

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

    try {
      const resp = await fetch(url);
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
    } finally {
      setPdfLoading(false);
    }
  };

  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    toast({
      title: 'Copied!',
      description: `${format} citation copied to clipboard.`,
    });
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const generateCitations = () => {
    if (!article) return { apa: '', harvard: '', chicago: '', ieee: '' };
    
    const authors = article.authors.map(a => a.name);
    const year = new Date(article.published_at).getFullYear();
    const journalTitle = article.issues?.journals?.title || 'Journal';
    const volume = article.issues?.volume;
    const issueNum = article.issues?.issue_number;
    const pages = article.pages || '';
    const doi = article.doi ? `https://doi.org/${article.doi}` : '';

    // Format author names for different styles
    const formatAuthorsAPA = () => {
      return authors.map((name, i) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          const lastName = parts[parts.length - 1];
          const initials = parts.slice(0, -1).map(n => n[0] + '.').join(' ');
          return `${lastName}, ${initials}`;
        }
        return name;
      }).join(', ');
    };

    const formatAuthorsHarvard = () => {
      if (authors.length === 1) return authors[0];
      if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
      return `${authors[0]} et al.`;
    };

    const formatAuthorsChicago = () => {
      if (authors.length === 1) {
        const parts = authors[0].trim().split(' ');
        if (parts.length >= 2) {
          const lastName = parts[parts.length - 1];
          const firstName = parts.slice(0, -1).join(' ');
          return `${lastName}, ${firstName}`;
        }
        return authors[0];
      }
      return authors.map((name, i) => {
        const parts = name.trim().split(' ');
        if (i === 0 && parts.length >= 2) {
          const lastName = parts[parts.length - 1];
          const firstName = parts.slice(0, -1).join(' ');
          return `${lastName}, ${firstName}`;
        }
        return name;
      }).join(', ');
    };

    const formatAuthorsIEEE = () => {
      return authors.map(name => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          const lastName = parts[parts.length - 1];
          const initials = parts.slice(0, -1).map(n => n[0] + '.').join(' ');
          return `${initials} ${lastName}`;
        }
        return name;
      }).join(', ');
    };

    // APA 7th Edition
    const apa = `${formatAuthorsAPA()} (${year}). ${article.title}. ${journalTitle}, ${volume}(${issueNum})${pages ? `, ${pages}` : ''}.${doi ? ` ${doi}` : ''}`;

    // Harvard
    const harvard = `${formatAuthorsHarvard()} (${year}) '${article.title}', ${journalTitle}, ${volume}(${issueNum})${pages ? `, pp. ${pages}` : ''}.${doi ? ` Available at: ${doi}` : ''}`;

    // Chicago 17th Edition
    const chicago = `${formatAuthorsChicago()}. "${article.title}." ${journalTitle} ${volume}, no. ${issueNum} (${year})${pages ? `: ${pages}` : ''}.${doi ? ` ${doi}` : ''}`;

    // IEEE
    const ieee = `${formatAuthorsIEEE()}, "${article.title}," ${journalTitle}, vol. ${volume}, no. ${issueNum}${pages ? `, pp. ${pages}` : ''}, ${year}.${doi ? ` doi: ${article.doi}` : ''}`;

    return { apa, harvard, chicago, ieee };
  };

  const citations = generateCitations();

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
              <Tabs defaultValue="apa" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-3">
                  <TabsTrigger value="apa" className="text-xs">APA</TabsTrigger>
                  <TabsTrigger value="harvard" className="text-xs">Harvard</TabsTrigger>
                  <TabsTrigger value="chicago" className="text-xs">Chicago</TabsTrigger>
                  <TabsTrigger value="ieee" className="text-xs">IEEE</TabsTrigger>
                </TabsList>
                
                <TabsContent value="apa" className="mt-0">
                  <div className="bg-muted/50 rounded p-3 text-sm text-muted-foreground mb-3 min-h-[80px]">
                    {citations.apa}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => copyToClipboard(citations.apa, 'APA')}
                  >
                    {copiedFormat === 'APA' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copiedFormat === 'APA' ? 'Copied!' : 'Copy APA Citation'}
                  </Button>
                </TabsContent>
                
                <TabsContent value="harvard" className="mt-0">
                  <div className="bg-muted/50 rounded p-3 text-sm text-muted-foreground mb-3 min-h-[80px]">
                    {citations.harvard}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => copyToClipboard(citations.harvard, 'Harvard')}
                  >
                    {copiedFormat === 'Harvard' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copiedFormat === 'Harvard' ? 'Copied!' : 'Copy Harvard Citation'}
                  </Button>
                </TabsContent>
                
                <TabsContent value="chicago" className="mt-0">
                  <div className="bg-muted/50 rounded p-3 text-sm text-muted-foreground mb-3 min-h-[80px]">
                    {citations.chicago}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => copyToClipboard(citations.chicago, 'Chicago')}
                  >
                    {copiedFormat === 'Chicago' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copiedFormat === 'Chicago' ? 'Copied!' : 'Copy Chicago Citation'}
                  </Button>
                </TabsContent>
                
                <TabsContent value="ieee" className="mt-0">
                  <div className="bg-muted/50 rounded p-3 text-sm text-muted-foreground mb-3 min-h-[80px]">
                    {citations.ieee}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => copyToClipboard(citations.ieee, 'IEEE')}
                  >
                    {copiedFormat === 'IEEE' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copiedFormat === 'IEEE' ? 'Copied!' : 'Copy IEEE Citation'}
                  </Button>
                </TabsContent>
              </Tabs>
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
