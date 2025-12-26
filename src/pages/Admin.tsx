import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAllSubmissions, useUpdateSubmissionStatus, useDeleteSubmission } from '@/hooks/useSubmissions';
import { 
  useJournals, useCreateJournal, useUpdateJournal, useDeleteJournal,
  useAllIssues, useCreateIssue, useUpdateIssue, useDeleteIssue,
  useAllArticles, useCreateArticle, useUpdateArticle, useDeleteArticle
} from '@/hooks/useJournals';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, Clock, CheckCircle, XCircle, AlertCircle, Eye, User, Calendar, 
  BookOpen, FileText, Plus, Pencil, Trash2, Download, ExternalLink
} from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: Eye },
  revision_required: { label: 'Revision Required', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  published: { label: 'Published', color: 'bg-primary/10 text-primary', icon: CheckCircle }
};

const Admin = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  
  // Data hooks
  const { data: submissions, isLoading: submissionsLoading } = useAllSubmissions();
  const { data: journals, isLoading: journalsLoading } = useJournals();
  const { data: issues, isLoading: issuesLoading } = useAllIssues();
  const { data: articles, isLoading: articlesLoading } = useAllArticles();
  
  // Mutations
  const updateStatus = useUpdateSubmissionStatus();
  const deleteSubmission = useDeleteSubmission();
  const createJournal = useCreateJournal();
  const updateJournal = useUpdateJournal();
  const deleteJournal = useDeleteJournal();
  const createIssue = useCreateIssue();
  const updateIssue = useUpdateIssue();
  const deleteIssue = useDeleteIssue();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  
  // Dialog states
  const [submissionDialog, setSubmissionDialog] = useState<any>(null);
  const [journalDialog, setJournalDialog] = useState<any>(null);
  const [issueDialog, setIssueDialog] = useState<any>(null);
  const [articleDialog, setArticleDialog] = useState<any>(null);
  const [publishDialog, setPublishDialog] = useState<any>(null);
  
  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [editorNotes, setEditorNotes] = useState('');
  const [publishPdfFile, setPublishPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">{!user ? 'Login Required' : 'Access Denied'}</h1>
          <p className="text-muted-foreground mb-6">{!user ? 'You need to be logged in.' : "You don't have permission."}</p>
          <Link to={!user ? '/auth' : '/'}><Button>{!user ? 'Login' : 'Back to Home'}</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleUpdateSubmissionStatus = async () => {
    if (!submissionDialog) return;
    try {
      await updateStatus.mutateAsync({ id: submissionDialog.id, status: newStatus as any, editor_notes: editorNotes });
      toast({ title: 'Status Updated' });
      setSubmissionDialog(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    try {
      await deleteSubmission.mutateAsync(id);
      toast({ title: 'Submission Deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    }
  };

  const handleSaveJournal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      subtitle: formData.get('subtitle') as string,
      description: formData.get('description') as string,
      issn: formData.get('issn') as string,
      impact_factor: formData.get('impact_factor') as string,
      frequency: formData.get('frequency') as string,
      slug: formData.get('slug') as string,
      editor_in_chief: formData.get('editor_in_chief') as string,
      scope: formData.get('scope') as string,
      image_url: null
    };
    try {
      if (journalDialog?.id) {
        await updateJournal.mutateAsync({ id: journalDialog.id, ...data });
      } else {
        await createJournal.mutateAsync(data);
      }
      toast({ title: journalDialog?.id ? 'Journal Updated' : 'Journal Created' });
      setJournalDialog(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteJournal = async (id: string) => {
    if (!confirm('Delete this journal and all its issues/articles?')) return;
    try {
      await deleteJournal.mutateAsync(id);
      toast({ title: 'Journal Deleted' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleSaveIssue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      journal_id: formData.get('journal_id') as string,
      volume: parseInt(formData.get('volume') as string),
      issue_number: parseInt(formData.get('issue_number') as string),
      year: parseInt(formData.get('year') as string),
      month: formData.get('month') as string,
      is_current: formData.get('is_current') === 'true',
      published_at: new Date().toISOString()
    };
    try {
      if (issueDialog?.id) {
        await updateIssue.mutateAsync({ id: issueDialog.id, ...data });
      } else {
        await createIssue.mutateAsync(data);
      }
      toast({ title: issueDialog?.id ? 'Issue Updated' : 'Issue Created' });
      setIssueDialog(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (!confirm('Delete this issue and all its articles?')) return;
    try {
      await deleteIssue.mutateAsync(id);
      toast({ title: 'Issue Deleted' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handlePublishSubmission = async (submission: any, issueId: string, pages: string, doi: string) => {
    try {
      setUploadingPdf(true);
      
      let finalPdfUrl = submission.manuscript_url;
      
      // If admin uploaded a new PDF, use that instead
      if (publishPdfFile) {
        const fileExt = publishPdfFile.name.split('.').pop();
        const fileName = `published/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('manuscripts')
          .upload(fileName, publishPdfFile);
        
        if (uploadError) throw uploadError;
        finalPdfUrl = fileName;
      }
      
      await createArticle.mutateAsync({
        issue_id: issueId,
        title: submission.title,
        abstract: submission.abstract,
        keywords: submission.keywords,
        authors: submission.authors,
        pdf_url: finalPdfUrl,
        doi: doi || null,
        pages,
        published_at: new Date().toISOString()
      });
      await updateStatus.mutateAsync({ id: submission.id, status: 'published', editor_notes: 'Published to journal' });
      toast({ title: 'Article Published!' });
      setPublishDialog(null);
      setPublishPdfFile(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await deleteArticle.mutateAsync(id);
      toast({ title: 'Article Deleted' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const downloadManuscript = async (path: string) => {
    const { data, error } = await supabase.storage.from('manuscripts').download(path);

    if (error || !data) {
      toast({
        title: 'Download failed',
        description: error?.message ?? 'Could not download this file.',
        variant: 'destructive',
      });
      return;
    }

    const blobUrl = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = path.split('/').pop() || 'manuscript';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
  };

  const pendingCount = submissions?.filter(s => s.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage journals, issues, articles and submissions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4"><div className="text-2xl font-bold">{journals?.length || 0}</div><div className="text-sm text-muted-foreground">Journals</div></div>
          <div className="bg-card border rounded-lg p-4"><div className="text-2xl font-bold">{issues?.length || 0}</div><div className="text-sm text-muted-foreground">Issues</div></div>
          <div className="bg-card border rounded-lg p-4"><div className="text-2xl font-bold">{articles?.length || 0}</div><div className="text-sm text-muted-foreground">Articles</div></div>
          <div className="bg-yellow-50 border-yellow-200 border rounded-lg p-4"><div className="text-2xl font-bold text-yellow-800">{pendingCount}</div><div className="text-sm text-yellow-700">Pending</div></div>
          <div className="bg-card border rounded-lg p-4"><div className="text-2xl font-bold">{submissions?.length || 0}</div><div className="text-sm text-muted-foreground">Submissions</div></div>
        </div>

        <Tabs defaultValue="submissions" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="journals">Journals</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
          </TabsList>

          {/* SUBMISSIONS TAB */}
          <TabsContent value="submissions" className="space-y-4">
            {submissionsLoading ? <div>Loading...</div> : submissions?.length ? (
              submissions.map((sub) => {
                const status = statusConfig[sub.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <div key={sub.id} className="bg-card border rounded-lg p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className={status.color}><StatusIcon className="w-3 h-3 mr-1" />{status.label}</Badge>
                          <span className="text-sm text-muted-foreground">{(sub as any).journals?.title}</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1 truncate">{sub.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{sub.abstract}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span><User className="w-4 h-4 inline mr-1" />{(sub as any).profiles?.full_name || (sub as any).profiles?.email || `${sub.user_id.slice(0, 8)}…`}</span>
                          <span><Calendar className="w-4 h-4 inline mr-1" />{new Date(sub.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {sub.manuscript_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadManuscript(sub.manuscript_url!)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {sub.status === 'accepted' && (
                          <Button size="sm" variant="default" onClick={() => setPublishDialog(sub)}><BookOpen className="w-4 h-4 mr-1" />Publish</Button>
                        )}
                        <Button size="sm" onClick={() => { setSubmissionDialog(sub); setNewStatus(sub.status); setEditorNotes(sub.editor_notes || ''); }}>Review</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSubmission(sub.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : <div className="text-center py-12 text-muted-foreground">No submissions yet.</div>}
          </TabsContent>

          {/* JOURNALS TAB */}
          <TabsContent value="journals" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setJournalDialog({})}><Plus className="w-4 h-4 mr-2" />Add Journal</Button>
            </div>
            {journalsLoading ? <div>Loading...</div> : journals?.map((j) => (
              <div key={j.id} className="bg-card border rounded-lg p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{j.title}</h3>
                  <p className="text-sm text-muted-foreground">ISSN: {j.issn} | IF: {j.impact_factor}</p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/journal/${j.slug}`}><Button size="sm" variant="outline"><ExternalLink className="w-4 h-4" /></Button></Link>
                  <Button size="sm" variant="outline" onClick={() => setJournalDialog(j)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteJournal(j.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ISSUES TAB */}
          <TabsContent value="issues" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIssueDialog({})}><Plus className="w-4 h-4 mr-2" />Add Issue</Button>
            </div>
            {issuesLoading ? <div>Loading...</div> : issues?.map((i: any) => (
              <div key={i.id} className="bg-card border rounded-lg p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{i.journals?.title} - Vol. {i.volume}, Issue {i.issue_number}</h3>
                  <p className="text-sm text-muted-foreground">{i.month} {i.year} {i.is_current && <Badge className="ml-2">Current</Badge>}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIssueDialog(i)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteIssue(i.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ARTICLES TAB */}
          <TabsContent value="articles" className="space-y-4">
            {articlesLoading ? <div>Loading...</div> : articles?.length ? articles.map((a: any) => (
              <div key={a.id} className="bg-card border rounded-lg p-5 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {a.issues?.journals?.title} - Vol. {a.issues?.volume}, Issue {a.issues?.issue_number} | Pages: {a.pages || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Views: {a.views} | Downloads: {a.downloads}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteArticle(a.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            )) : <div className="text-center py-12 text-muted-foreground">No articles yet.</div>}
          </TabsContent>
        </Tabs>
      </main>

      {/* Review Submission Dialog */}
      <Dialog open={!!submissionDialog} onOpenChange={() => setSubmissionDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Review Submission</DialogTitle></DialogHeader>
          {submissionDialog && (
            <div className="space-y-4">
              <div><h3 className="font-semibold">{submissionDialog.title}</h3></div>
              <div><Label>Abstract:</Label><p className="text-sm text-muted-foreground mt-1">{submissionDialog.abstract}</p></div>
              <div><Label>Authors:</Label>
                {(submissionDialog.authors as any[]).map((a, i) => <p key={i} className="text-sm text-muted-foreground">{a.name} - {a.email}</p>)}
              </div>
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="revision_required">Revision Required</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Editor Notes</Label>
                <Textarea value={editorNotes} onChange={(e) => setEditorNotes(e.target.value)} rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmissionDialog(null)}>Cancel</Button>
            <Button onClick={handleUpdateSubmissionStatus} disabled={updateStatus.isPending}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Journal Dialog */}
      <Dialog open={!!journalDialog} onOpenChange={() => setJournalDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{journalDialog?.id ? 'Edit Journal' : 'Add Journal'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveJournal} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title *</Label><Input name="title" defaultValue={journalDialog?.title} required /></div>
              <div className="space-y-2"><Label>Slug *</Label><Input name="slug" defaultValue={journalDialog?.slug} required /></div>
            </div>
            <div className="space-y-2"><Label>Subtitle</Label><Input name="subtitle" defaultValue={journalDialog?.subtitle} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea name="description" defaultValue={journalDialog?.description} rows={3} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>ISSN *</Label><Input name="issn" defaultValue={journalDialog?.issn} required /></div>
              <div className="space-y-2"><Label>Impact Factor</Label><Input name="impact_factor" defaultValue={journalDialog?.impact_factor} /></div>
              <div className="space-y-2"><Label>Frequency</Label><Input name="frequency" defaultValue={journalDialog?.frequency} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Editor-in-Chief</Label><Input name="editor_in_chief" defaultValue={journalDialog?.editor_in_chief} /></div>
              <div className="space-y-2"><Label>Scope</Label><Input name="scope" defaultValue={journalDialog?.scope} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setJournalDialog(null)}>Cancel</Button>
              <Button type="submit">{journalDialog?.id ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue Dialog */}
      <Dialog open={!!issueDialog} onOpenChange={() => setIssueDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{issueDialog?.id ? 'Edit Issue' : 'Add Issue'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveIssue} className="space-y-4">
            <div className="space-y-2">
              <Label>Journal *</Label>
              <Select name="journal_id" defaultValue={issueDialog?.journal_id}>
                <SelectTrigger><SelectValue placeholder="Select journal" /></SelectTrigger>
                <SelectContent>
                  {journals?.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Volume *</Label><Input name="volume" type="number" defaultValue={issueDialog?.volume} required /></div>
              <div className="space-y-2"><Label>Issue # *</Label><Input name="issue_number" type="number" defaultValue={issueDialog?.issue_number} required /></div>
              <div className="space-y-2"><Label>Year *</Label><Input name="year" type="number" defaultValue={issueDialog?.year || new Date().getFullYear()} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Month</Label><Input name="month" defaultValue={issueDialog?.month} placeholder="e.g., January" /></div>
              <div className="space-y-2">
                <Label>Current Issue?</Label>
                <Select name="is_current" defaultValue={issueDialog?.is_current ? 'true' : 'false'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIssueDialog(null)}>Cancel</Button>
              <Button type="submit">{issueDialog?.id ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={!!publishDialog} onOpenChange={() => { setPublishDialog(null); setPublishPdfFile(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Publish to Journal</DialogTitle></DialogHeader>
          {publishDialog && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handlePublishSubmission(
                publishDialog, 
                formData.get('issue_id') as string, 
                formData.get('pages') as string,
                formData.get('doi') as string
              );
            }} className="space-y-4">
              <p className="text-sm text-muted-foreground">Publishing: <strong>{publishDialog.title}</strong></p>
              
              <div className="space-y-2">
                <Label>Select Issue *</Label>
                <Select name="issue_id" required>
                  <SelectTrigger><SelectValue placeholder="Select issue" /></SelectTrigger>
                  <SelectContent>
                    {issues?.filter((i: any) => i.journal_id === publishDialog.journal_id).map((i: any) => (
                      <SelectItem key={i.id} value={i.id}>Vol. {i.volume}, Issue {i.issue_number} ({i.year})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Pages</Label><Input name="pages" placeholder="e.g., 1-15" /></div>
                <div className="space-y-2"><Label>DOI</Label><Input name="doi" placeholder="e.g., 10.1234/..." /></div>
              </div>
              
              <div className="space-y-2">
                <Label>Upload Final PDF (Template-formatted)</Label>
                <p className="text-xs text-muted-foreground">Download the original manuscript above, format it with your journal template, then upload the final version here.</p>
                <Input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setPublishPdfFile(e.target.files?.[0] || null)}
                />
                {publishPdfFile && (
                  <p className="text-sm text-green-600">Selected: {publishPdfFile.name}</p>
                )}
                {!publishPdfFile && publishDialog.manuscript_url && (
                  <p className="text-xs text-muted-foreground">If no file uploaded, original manuscript will be used.</p>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setPublishDialog(null); setPublishPdfFile(null); }}>Cancel</Button>
                <Button type="submit" disabled={uploadingPdf}>
                  {uploadingPdf ? 'Uploading...' : 'Publish Article'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
