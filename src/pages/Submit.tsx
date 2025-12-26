import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useJournals } from '@/hooks/useJournals';
import { useCreateSubmission } from '@/hooks/useSubmissions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface Author {
  name: string;
  affiliation: string;
  email: string;
}

const Submit = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: journals, isLoading: journalsLoading } = useJournals();
  const createSubmission = useCreateSubmission();
  
  const [step, setStep] = useState(1);
  const [journalId, setJournalId] = useState('');
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [authors, setAuthors] = useState<Author[]>([{ name: '', affiliation: '', email: '' }]);

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

  const handleSubmit = async () => {
    if (!journalId || !title || !abstract) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (authors.some(a => !a.name || !a.email)) {
      toast({
        title: 'Author Information Required',
        description: 'Please provide name and email for all authors.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createSubmission.mutateAsync({
        journal_id: journalId,
        title,
        abstract,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        authors
      });

      toast({
        title: 'Submission Successful!',
        description: 'Your article has been submitted for review.'
      });
      
      setStep(4); // Success step
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your article. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`} />
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
                          <SelectItem key={journal.id} value={journal.id}>
                            {journal.title}
                          </SelectItem>
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
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter the title of your article"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract *</Label>
                  <Textarea
                    id="abstract"
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Enter the abstract (250-300 words)"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Enter keywords separated by commas"
                  />
                  <p className="text-xs text-muted-foreground">Separate keywords with commas (e.g., machine learning, healthcare, AI)</p>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!title || !abstract}>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAuthor(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          value={author.name}
                          onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                          placeholder="Dr. John Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={author.email}
                          onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                          placeholder="john@university.edu"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Affiliation</Label>
                        <Input
                          value={author.affiliation}
                          onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)}
                          placeholder="University of Example, Department of Science"
                        />
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
                  <Button 
                    onClick={handleSubmit} 
                    disabled={createSubmission.isPending}
                  >
                    {createSubmission.isPending ? 'Submitting...' : 'Submit Article'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
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
