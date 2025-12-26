import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJournal, useJournalIssues, useIssueArticles } from '@/hooks/useJournals';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  BookOpen, Calendar, Award, Users, FileText, 
  Download, Eye, ArrowRight, FileDown
} from 'lucide-react';

// Component to display articles for an issue
const IssueArticlesList = ({ issueId, journalSlug }: { issueId: string; journalSlug: string }) => {
  const { data: articles, isLoading } = useIssueArticles(issueId);
  const navigate = useNavigate();

  const openPdf = (articleId: string) => {
    // Navigate to dedicated PDF viewer page
    navigate(`/journal/${journalSlug}/article/${articleId}/pdf`);
  };

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
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link 
                to={`/journal/${journalSlug}/article/${article.id}`}
                className="font-medium text-foreground hover:text-primary transition-colors block mb-1"
              >
                {article.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {(article.authors as { name: string }[]).map(a => a.name).join(', ')}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                {article.pages && <span>Pages: {article.pages}</span>}
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {article.downloads}
                </span>
              </div>
            </div>

            {article.pdf_url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openPdf(article.id)}
                className="flex-shrink-0"
              >
                <FileDown className="w-4 h-4 mr-2" />
                PDF
              </Button>
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
  const [openDialog, setOpenDialog] = useState<'guidelines' | 'ethics' | 'review' | null>(null);

  const dialogContent = {
    guidelines: {
      title: 'Author Guidelines',
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <section>
            <h4 className="font-semibold text-foreground mb-2">Manuscript Preparation</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Manuscripts should be written in English with clear and concise language.</li>
              <li>Use Microsoft Word (.doc, .docx) format for submission.</li>
              <li>The manuscript should include: Title, Abstract, Keywords, Introduction, Methods, Results, Discussion, Conclusion, and References.</li>
              <li>Abstract should not exceed 300 words.</li>
              <li>Include 4-6 keywords for indexing purposes.</li>
            </ul>
          </section>
          <section>
            <h4 className="font-semibold text-foreground mb-2">Formatting Requirements</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use Times New Roman, 12-point font, double-spaced.</li>
              <li>Margins should be 2.5 cm on all sides.</li>
              <li>Number all pages consecutively.</li>
              <li>Figures and tables should be placed at the end of the manuscript.</li>
            </ul>
          </section>
          <section>
            <h4 className="font-semibold text-foreground mb-2">References</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Follow APA (7th edition) citation style.</li>
              <li>Include DOI for all references where available.</li>
              <li>Ensure all cited works are listed in the reference section.</li>
            </ul>
          </section>
        </div>
      ),
    },
    ethics: {
      title: 'Publication Ethics',
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <section>
            <h4 className="font-semibold text-foreground mb-2">Authorship</h4>
            <p>All listed authors must have made significant contributions to the research. Ghost authorship and gift authorship are not permitted. All authors must approve the final version of the manuscript.</p>
          </section>
          <section>
            <h4 className="font-semibold text-foreground mb-2">Originality & Plagiarism</h4>
            <p>Authors must ensure their work is entirely original. All manuscripts are screened for plagiarism using industry-standard software. Plagiarism in any form is unacceptable and will result in immediate rejection.</p>
          </section>
          <section>
            <h4 className="font-semibold text-foreground mb-2">Conflict of Interest</h4>
            <p>Authors must disclose any financial or personal relationships that could influence their research. Funding sources must be acknowledged in the manuscript.</p>
          </section>
          <section>
            <h4 className="font-semibold text-foreground mb-2">Data Integrity</h4>
            <p>Authors are responsible for the accuracy of their data. Fabrication, falsification, or inappropriate data manipulation is strictly prohibited.</p>
          </section>
          <section>
            <h4 className="font-semibold text-foreground mb-2">Ethical Approval</h4>
            <p>Research involving human subjects or animals must have appropriate ethical approval from relevant institutional review boards.</p>
          </section>
        </div>
      ),
    },
    review: {
      title: 'Peer Review Process',
      content: (
        <div className="space-y-4 text-sm text-muted-foreground">
          <section>
            <h4 className="font-semibold text-foreground mb-2">Double-Blind Review</h4>
            <p>Our journal employs a double-blind peer review process. Both the reviewers and authors remain anonymous throughout the review process to ensure impartiality.</p>
          </section>
          <section>
            <h4 className="font-semibold text-foreground mb-2">Review Timeline</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Initial Screening:</strong> 3-5 business days</li>
              <li><strong>Peer Review:</strong> 2-4 weeks</li>
              <li><strong>Editorial Decision:</strong> 1 week after reviews received</li>
              <li><strong>Revision Period:</strong> 2 weeks (if required)</li>
            </ul>
          </section>
          <section>
            <h4 className="font-semibold text-foreground mb-2">Review Criteria</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Originality and significance of the research</li>
              <li>Clarity and quality of writing</li>
              <li>Appropriateness of methodology</li>
              <li>Validity of conclusions</li>
              <li>Relevance to the journal scope</li>
            </ul>
          </section>
          <section>
            <h4 className="font-semibold text-foreground mb-2">Possible Outcomes</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Accept:</strong> Manuscript accepted without changes</li>
              <li><strong>Minor Revision:</strong> Small changes required</li>
              <li><strong>Major Revision:</strong> Significant changes needed</li>
              <li><strong>Reject:</strong> Manuscript not suitable for publication</li>
            </ul>
          </section>
        </div>
      ),
    },
  };

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
                  <button 
                    onClick={() => setOpenDialog('guidelines')}
                    className="text-primary hover:underline flex items-center gap-2 w-full text-left"
                  >
                    <FileText className="w-4 h-4" />
                    Author Guidelines
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setOpenDialog('ethics')}
                    className="text-primary hover:underline flex items-center gap-2 w-full text-left"
                  >
                    <FileText className="w-4 h-4" />
                    Publication Ethics
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setOpenDialog('review')}
                    className="text-primary hover:underline flex items-center gap-2 w-full text-left"
                  >
                    <FileText className="w-4 h-4" />
                    Peer Review Process
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog for Author Info */}
      <Dialog open={openDialog !== null} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {openDialog && dialogContent[openDialog].title}
            </DialogTitle>
          </DialogHeader>
          {openDialog && dialogContent[openDialog].content}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default JournalDetail;
