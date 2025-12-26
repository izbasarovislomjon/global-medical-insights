import { useParams, Link } from 'react-router-dom';
import { useJournal, useJournalIssues, useIssueArticles } from '@/hooks/useJournals';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, Calendar, Award, Users, FileText, 
  Download, Eye, ArrowRight, FileDown
} from 'lucide-react';

// Component to display articles for an issue
const IssueArticlesList = ({ issueId, journalSlug }: { issueId: string; journalSlug: string }) => {
  const { data: articles, isLoading } = useIssueArticles(issueId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return <p className="text-muted-foreground text-sm">No articles in this issue yet.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {articles.map((article) => (
        <div key={article.id} className="py-4 first:pt-0 last:pb-0">
          <Link 
            to={`/journal/${journalSlug}/article/${article.id}`}
            className="font-medium text-foreground hover:text-primary transition-colors block mb-1"
          >
            {article.title}
          </Link>
          <p className="text-sm text-muted-foreground">
            {(article.authors as { name: string }[]).map(a => a.name).join(', ')}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {article.pages && <span>Pages: {article.pages}</span>}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.views}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {article.downloads}
            </span>
            {article.pdf_url && (
              <a 
                href={article.pdf_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <FileDown className="w-3 h-3" />
                PDF
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const JournalDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: journal, isLoading: journalLoading } = useJournal(slug || '');
  const { data: issues, isLoading: issuesLoading } = useJournalIssues(journal?.id || '');

  if (journalLoading) {
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

  if (!journal) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Journal Not Found</h1>
          <p className="text-muted-foreground mb-6">The journal you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentIssue = issues?.find(i => i.is_current) || issues?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="header-gradient text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-primary-foreground/10 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <BookOpen className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                  ISSN: {journal.issn}
                </Badge>
                {journal.impact_factor && (
                  <Badge variant="secondary" className="bg-accent/20 text-primary-foreground">
                    <Award className="w-3 h-3 mr-1" />
                    IF: {journal.impact_factor}
                  </Badge>
                )}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">{journal.title}</h1>
              <p className="text-primary-foreground/80 text-lg">{journal.subtitle}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-primary-foreground/70">
                {journal.frequency && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {journal.frequency}
                  </span>
                )}
                {journal.editor_in_chief && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Editor: {journal.editor_in_chief}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6 overflow-x-auto">
            <a href="#about" className="py-4 px-2 border-b-2 border-primary text-primary font-medium">About</a>
            <a href="#issues" className="py-4 px-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground">Issues & Archives</a>
            <a href="#editorial" className="py-4 px-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground">Editorial Board</a>
            <Link to="/submit" className="py-4 px-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground">Submit Article</Link>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section id="about">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">About the Journal</h2>
              <p className="text-muted-foreground leading-relaxed">{journal.description}</p>
              {journal.scope && (
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground mb-2">Scope</h3>
                  <p className="text-muted-foreground">{journal.scope}</p>
                </div>
              )}
            </section>

            {/* Current Issue */}
            <section id="issues">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-2xl font-bold text-foreground">Current Issue</h2>
              </div>
              
              {issuesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : currentIssue ? (
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        Vol. {currentIssue.volume} No. {currentIssue.issue_number} ({currentIssue.year})
                      </h3>
                      {currentIssue.month && (
                        <p className="text-sm text-muted-foreground mt-1">{currentIssue.month}</p>
                      )}
                    </div>
                    <Badge variant="default">Current Issue</Badge>
                  </div>
                  
                  <IssueArticlesList issueId={currentIssue.id} journalSlug={slug || ''} />
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No issues published yet.</p>
                </div>
              )}

              {/* Archive List */}
              {issues && issues.length > 1 && (
                <div className="mt-8">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4">Previous Issues</h3>
                  <div className="space-y-4">
                    {issues.filter(i => i.id !== currentIssue?.id).map((issue) => (
                      <div key={issue.id} className="bg-card border border-border rounded-lg p-6">
                        <h4 className="font-heading text-lg font-semibold text-foreground mb-4">
                          Vol. {issue.volume} No. {issue.issue_number} ({issue.year})
                          {issue.month && <span className="text-muted-foreground font-normal ml-2">— {issue.month}</span>}
                        </h4>
                        <IssueArticlesList issueId={issue.id} journalSlug={slug || ''} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submit Article CTA */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-6 text-primary-foreground">
              <h3 className="font-heading font-bold text-lg mb-2">Submit Your Research</h3>
              <p className="text-primary-foreground/80 text-sm mb-4">
                Share your findings with the global research community.
              </p>
              <Link to="/submit">
                <Button variant="secondary" className="w-full">
                  Make a Submission
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Journal Info */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-heading font-bold text-foreground mb-4">Journal Information</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ISSN</dt>
                  <dd className="font-medium text-foreground">{journal.issn}</dd>
                </div>
                {journal.impact_factor && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Impact Factor</dt>
                    <dd className="font-medium text-foreground">{journal.impact_factor}</dd>
                  </div>
                )}
                {journal.frequency && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Frequency</dt>
                    <dd className="font-medium text-foreground">{journal.frequency}</dd>
                  </div>
                )}
                {journal.editor_in_chief && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Editor-in-Chief</dt>
                    <dd className="font-medium text-foreground">{journal.editor_in_chief}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Author Guidelines */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-heading font-bold text-foreground mb-4">For Authors</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-primary hover:underline flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Author Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Publication Ethics
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Peer Review Process
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JournalDetail;
