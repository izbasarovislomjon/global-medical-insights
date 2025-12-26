import Header from '@/components/Header';
import Hero from '@/components/Hero';
import JournalCard from '@/components/JournalCard';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

const journals = [
  {
    title: 'Web of Medicine',
    subtitle: 'Journal of Medicine, Practice and Nursing',
    description: 'An international open access journal in medicine, medical practice and nursing. The journal publishes research in medical informatics, healthcare systems evaluation, clinical decision making, and medical education.',
    issn: '2938-3765',
    impactFactor: '7.555',
    frequency: 'Monthly (12 issues/year)',
  },
  {
    title: 'Web of Scientists and Scholars',
    subtitle: 'Journal of Multidisciplinary Research',
    description: 'An open access peer-reviewed international journal in multidisciplinary research. Publishes original research in physics, biology, chemistry, engineering, technology and food sciences.',
    issn: '2938-3811',
    impactFactor: '7.995',
    frequency: 'Monthly (12 issues/year)',
  },
  {
    title: 'Web of Education',
    subtitle: 'Journal of Educational Sciences',
    description: 'An international journal in educational sciences. Publishes research in pedagogy, teaching methodology, modern educational technologies and educational management.',
    issn: '2938-3828',
    impactFactor: '6.875',
    frequency: 'Monthly (12 issues/year)',
  },
  {
    title: 'Web of Technology',
    subtitle: 'Journal of Engineering and Innovation',
    description: 'An international journal in engineering and innovation. Publishes research in information technology, artificial intelligence, robotics and modern technological solutions.',
    issn: '2938-3835',
    impactFactor: '8.125',
    frequency: 'Monthly (12 issues/year)',
  },
  {
    title: 'Web of Economics',
    subtitle: 'Journal of Business and Finance',
    description: 'An international journal in economics and finance. Publishes research in macroeconomics, microeconomics, financial markets and business management.',
    issn: '2938-3842',
    impactFactor: '7.250',
    frequency: 'Monthly (12 issues/year)',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="mb-8">
              <h2 id="journals" className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                Our Journals
              </h2>
              <p className="text-muted-foreground">
                All our journals are open access and meet peer-reviewed standards
              </p>
            </div>

            <div className="space-y-6">
              {journals.map((journal, index) => (
                <JournalCard
                  key={index}
                  {...journal}
                  delay={index * 100}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
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
