import Header from '@/components/Header';
import Hero from '@/components/Hero';
import JournalCard from '@/components/JournalCard';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useJournals } from '@/hooks/useJournals';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { data: journals, isLoading } = useJournals();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div id="journals" className="flex-1">
            <div className="mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                Our Journals
              </h2>
              <p className="text-muted-foreground">
                All our journals are open access and meet peer-reviewed standards
              </p>
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <>
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </>
              ) : (
                journals?.map((journal, index) => (
                  <JournalCard
                    key={journal.id}
                    id={journal.id}
                    title={journal.title}
                    subtitle={journal.subtitle || ''}
                    description={journal.description || ''}
                    issn={journal.issn}
                    impactFactor={journal.impact_factor || ''}
                    frequency={journal.frequency || ''}
                    imageUrl={journal.image_url || undefined}
                    slug={journal.slug}
                    delay={index * 100}
                  />
                ))
              )}
            </div>
          </div>

          <div className="lg:w-80 flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
