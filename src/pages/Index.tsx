import Header from '@/components/Header';
import Hero from '@/components/Hero';
import JournalCard from '@/components/JournalCard';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

const journals = [
  {
    title: 'Web of Medicine',
    subtitle: 'Journal of Medicine, Practice and Nursing',
    description: 'Tibbiyot, amaliy tibbiyot va hamshiralik bo\'yicha xalqaro ochiq kirishli jurnal. Jurnal tibbiyot informatikasi, sog\'liqni saqlash tizimlarini baholash, klinik qarorlar qabul qilish va tibbiy ta\'lim sohasidagi tadqiqotlarni nashr etadi.',
    issn: '2938-3765',
    impactFactor: '7.555',
    frequency: 'Oylik (12 son/yil)',
  },
  {
    title: 'Web of Scientists and Scholars',
    subtitle: 'Journal of Multidisciplinary Research',
    description: 'Ko\'p tarmoqli tadqiqotlar bo\'yicha ochiq kirishli peer-reviewed xalqaro jurnal. Fizika, biologiya, kimyo, muhandislik, texnologiya va oziq-ovqat fanlari sohasidagi original tadqiqotlarni nashr etadi.',
    issn: '2938-3811',
    impactFactor: '7.995',
    frequency: 'Oylik (12 son/yil)',
  },
  {
    title: 'Web of Education',
    subtitle: 'Journal of Educational Sciences',
    description: 'Ta\'lim fanlari bo\'yicha xalqaro jurnal. Pedagogika, ta\'lim metodikasi, zamonaviy ta\'lim texnologiyalari va ta\'lim boshqaruvi bo\'yicha tadqiqotlarni nashr etadi.',
    issn: '2938-3828',
    impactFactor: '6.875',
    frequency: 'Oylik (12 son/yil)',
  },
  {
    title: 'Web of Technology',
    subtitle: 'Journal of Engineering and Innovation',
    description: 'Muhandislik va innovatsiyalar bo\'yicha xalqaro jurnal. Axborot texnologiyalari, sun\'iy intellekt, robototexnika va zamonaviy texnologik yechimlar bo\'yicha tadqiqotlarni nashr etadi.',
    issn: '2938-3835',
    impactFactor: '8.125',
    frequency: 'Oylik (12 son/yil)',
  },
  {
    title: 'Web of Economics',
    subtitle: 'Journal of Business and Finance',
    description: 'Iqtisodiyot va moliya fanlari bo\'yicha xalqaro jurnal. Makroiqtisodiyot, mikroiqtisodiyot, moliya bozorlari va biznes boshqaruvi sohasidagi tadqiqotlarni nashr etadi.',
    issn: '2938-3842',
    impactFactor: '7.250',
    frequency: 'Oylik (12 son/yil)',
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
                Bizning jurnallar
              </h2>
              <p className="text-muted-foreground">
                Barcha jurnallarimiz ochiq kirishli va peer-reviewed standartlariga javob beradi
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
