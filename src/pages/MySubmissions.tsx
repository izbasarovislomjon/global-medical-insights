import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMySubmissions } from '@/hooks/useSubmissions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: Eye },
  revision_required: { label: 'Revision Required', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  published: { label: 'Published', color: 'bg-primary/10 text-primary', icon: CheckCircle }
};

const MySubmissions = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: submissions, isLoading } = useMySubmissions();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Login Required</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your submissions.</p>
          <Link to="/auth">
            <Button>Login / Register</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">My Submissions</h1>
              <p className="text-muted-foreground mt-1">Track the status of your submitted articles</p>
            </div>
            <Link to="/submit">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Submission
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const status = statusConfig[submission.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                
                return (
                  <div key={submission.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {(submission as any).journals?.title}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg text-foreground mb-2">
                          {submission.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {submission.abstract}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span>
                            Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                          </span>
                          {submission.keywords && submission.keywords.length > 0 && (
                            <span>
                              Keywords: {submission.keywords.slice(0, 3).join(', ')}
                            </span>
                          )}
                        </div>
                        {submission.editor_notes && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-1">Editor Notes:</p>
                            <p className="text-sm text-muted-foreground">{submission.editor_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">No Submissions Yet</h2>
              <p className="text-muted-foreground mb-6">You haven't submitted any articles yet.</p>
              <Link to="/submit">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your First Article
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MySubmissions;
