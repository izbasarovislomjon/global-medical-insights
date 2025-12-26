import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAllSubmissions, useUpdateSubmissionStatus } from '@/hooks/useSubmissions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Shield, Clock, CheckCircle, XCircle, 
  AlertCircle, Eye, User, Calendar, BookOpen 
} from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: Eye },
  revision_required: { label: 'Revision Required', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  published: { label: 'Published', color: 'bg-primary/10 text-primary', icon: CheckCircle }
};

const Admin = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: submissions, isLoading } = useAllSubmissions();
  const updateStatus = useUpdateSubmissionStatus();
  
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [editorNotes, setEditorNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

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
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Login Required</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to access the admin panel.</p>
          <Link to="/auth">
            <Button>Login</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const openReviewDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setNewStatus(submission.status);
    setEditorNotes(submission.editor_notes || '');
    setDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedSubmission) return;

    try {
      await updateStatus.mutateAsync({
        id: selectedSubmission.id,
        status: newStatus as any,
        editor_notes: editorNotes
      });

      toast({
        title: 'Status Updated',
        description: 'The submission status has been updated successfully.'
      });
      
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const pendingCount = submissions?.filter(s => s.status === 'pending').length || 0;
  const underReviewCount = submissions?.filter(s => s.status === 'under_review').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground">Manage article submissions and reviews</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-foreground">{submissions?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-800">{pendingCount}</div>
              <div className="text-sm text-yellow-700">Pending Review</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-800">{underReviewCount}</div>
              <div className="text-sm text-blue-700">Under Review</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-800">
                {submissions?.filter(s => s.status === 'published').length || 0}
              </div>
              <div className="text-sm text-green-700">Published</div>
            </div>
          </div>

          {/* Submissions List */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
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
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {(submission as any).journals?.title}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-lg text-foreground mb-2">
                          {submission.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {submission.abstract}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {(submission as any).profiles?.full_name || (submission as any).profiles?.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </span>
                          {submission.keywords && submission.keywords.length > 0 && (
                            <span>
                              Keywords: {submission.keywords.slice(0, 3).join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Authors */}
                        <div className="mt-3">
                          <span className="text-sm font-medium text-foreground">Authors: </span>
                          <span className="text-sm text-muted-foreground">
                            {(submission.authors as any[]).map(a => a.name).join(', ')}
                          </span>
                        </div>
                      </div>
                      
                      <Button onClick={() => openReviewDialog(submission)}>
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">No Submissions</h2>
              <p className="text-muted-foreground">There are no article submissions to review.</p>
            </div>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">{selectedSubmission.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(selectedSubmission as any).journals?.title}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Abstract:</p>
                <p className="text-sm text-muted-foreground">{selectedSubmission.abstract}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-1">Authors:</p>
                <div className="space-y-1">
                  {(selectedSubmission.authors as any[]).map((author, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      {author.name} ({author.email}) - {author.affiliation || 'No affiliation'}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Update Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="revision_required">Revision Required</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Editor Notes</label>
                <Textarea
                  value={editorNotes}
                  onChange={(e) => setEditorNotes(e.target.value)}
                  placeholder="Add notes for the author..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
