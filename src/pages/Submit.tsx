import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useJournals } from '@/hooks/useJournals';
import { useCreateSubmission } from '@/hooks/useSubmissions';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, X, ArrowRight, ArrowLeft, CheckCircle, Upload, File } from 'lucide-react';
import { z } from 'zod';

interface Author {
  name: string;
  affiliation: string;
  email: string;
}

const authorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  affiliation: z.string().max(200).optional(),
  email: z.string().trim().email("Invalid email").max(255)
});

const submissionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  abstract: z.string().trim().min(50, "Abstract must be at least 50 characters").max(5000),
  keywords: z.string().max(500)
});

const Submit = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: journals, isLoading: journalsLoading } = useJournals();
  const createSubmission = useCreateSubmission();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [journalId, setJournalId] = useState('');
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [authors, setAuthors] = useState<Author[]>([{ name: '', affiliation: '', email: '' }]);
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
          <p className="text-muted-foreground mb-6">You need to be logged in to submit an article.</p>
          <Link to="/auth">
            <Button>Login / Register</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const addAuthor = () => {
    setAuthors([...authors, { name: '', affiliation: '', email: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    const updated = [...authors];
    updated[index][field] = value;
    setAuthors(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Maximum file size is 20MB.',
          variant: 'destructive'
        });
        return;
      }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF or Word document.',
          variant: 'destructive'
        });
        return;
      }
      setManuscriptFile(file);
    }
  };

  const uploadManuscript = async (): Promise<string | null> => {
    if (!manuscriptFile || !user) return null;
    
    const fileExt = manuscriptFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('manuscripts')
      .upload(fileName, manuscriptFile);
    
    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload manuscript');
    }
    
    return fileName;
  };

  const handleSubmit = async () => {
    // Validate form data
    const formValidation = submissionSchema.safeParse({ title, abstract, keywords });
    if (!formValidation.success) {
      toast({
        title: 'Validation Error',
        description: formValidation.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    // Validate authors
    for (const author of authors) {
      const authorValidation = authorSchema.safeParse(author);
      if (!authorValidation.success) {
        toast({
          title: 'Author Validation Error',
          description: authorValidation.error.errors[0].message,
          variant: 'destructive'
        });
        return;
      }
    }

    if (!journalId) {
      toast({
        title: 'Missing Information',
        description: 'Please select a journal.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      let manuscriptUrl = null;
      if (manuscriptFile) {
        manuscriptUrl = await uploadManuscript();
      }

      await createSubmission.mutateAsync({
        journal_id: journalId,
        title,
        abstract,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        authors,
        manuscript_url: manuscriptUrl
      });

      toast({
        title: 'Submission Successful!',
        description: 'Your article has been submitted for review.'
      });
      
      setStep(5);
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your article. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-12 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="bg-card border border-border rounded-lg p-8">
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Select Journal</h1>
              <p className="text-muted-foreground mb-6">Choose the journal you want to submit your article to.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="journal">Journal *</Label>
                  <Select value={journalId} onValueChange={setJournalId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a journal" />
                    </SelectTrigger>
                    <SelectContent>
                      {journalsLoading ? (
                        <SelectItem value="loading" disabled>Loading journals...</SelectItem>
                      ) : (
                        journals?.map((journal) => (
                          <SelectItem key={journal.id} value={journal.id}>{journal.title}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={() => setStep(2)} disabled={!journalId}>
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-card border border-border rounded-lg p-8">
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Article Information</h1>
              <p className="text-muted-foreground mb-6">Provide details about your manuscript.</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Article Title *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter the title of your article" maxLength={500} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract * (min 50 characters)</Label>
                  <Textarea id="abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} placeholder="Enter the abstract (250-300 words)" rows={6} maxLength={5000} />
                  <p className="text-xs text-muted-foreground">{abstract.length}/5000 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Enter keywords separated by commas" maxLength={500} />
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!title || abstract.length < 50}>
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-card border border-border rounded-lg p-8">
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Authors</h1>
              <p className="text-muted-foreground mb-6">Add all authors and their affiliations.</p>
              
              <div className="space-y-6">
                {authors.map((author, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground">Author {index + 1}</span>
                      {authors.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeAuthor(index)} className="text-destructive hover:text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input value={author.name} onChange={(e) => updateAuthor(index, 'name', e.target.value)} placeholder="Dr. John Smith" maxLength={100} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input type="email" value={author.email} onChange={(e) => updateAuthor(index, 'email', e.target.value)} placeholder="john@university.edu" maxLength={255} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Affiliation</Label>
                        <Input value={author.affiliation} onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)} placeholder="University of Example, Department of Science" maxLength={200} />
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addAuthor} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Author
                </Button>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={() => setStep(4)} disabled={authors.some(a => !a.name || !a.email)}>
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-card border border-border rounded-lg p-8">
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Upload Manuscript</h1>
              <p className="text-muted-foreground mb-6">Upload your manuscript file (PDF or Word document).</p>
              
              <div className="space-y-6">
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {manuscriptFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <File className="w-10 h-10 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{manuscriptFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(manuscriptFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setManuscriptFile(null); }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PDF or Word document (max 20MB)</p>
                    </>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">Submission Summary</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Journal:</dt>
                      <dd className="text-foreground">{journals?.find(j => j.id === journalId)?.title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Title:</dt>
                      <dd className="text-foreground truncate max-w-[200px]">{title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Authors:</dt>
                      <dd className="text-foreground">{authors.length}</dd>
                    </div>
                  </dl>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={handleSubmit} disabled={uploading || createSubmission.isPending}>
                    {uploading || createSubmission.isPending ? 'Submitting...' : 'Submit Article'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Submission Complete!</h1>
              <p className="text-muted-foreground mb-6">
                Your article has been successfully submitted. Our editorial team will review it and get back to you soon.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/my-submissions">
                  <Button>View My Submissions</Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Submit;
