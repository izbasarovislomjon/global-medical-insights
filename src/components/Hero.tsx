import { ArrowRight, BookOpen, Users, Award, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const stats = [
    { icon: BookOpen, value: '12+', label: 'Journals' },
    { icon: Users, value: '1500+', label: 'Authors' },
    { icon: Award, value: '7.5', label: 'Avg. IF' },
    { icon: Globe, value: '78', label: 'Countries' },
  ];

  return (
    <section className="relative bg-gradient-to-br from-muted via-background to-muted py-12 md:py-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-journal-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 animate-fade-in">
            🌍 International Scientific Publishing
          </span>
          
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 animate-fade-in leading-tight" style={{ animationDelay: '100ms' }}>
            A Global Platform for 
            <span className="text-primary"> Quality Research</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '200ms' }}>
            International Journal of Applied Medical Research - an open access, peer-reviewed 
            international scientific journals platform. Share your research with the world.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Button className="btn-primary-journal gap-2 text-base px-6 py-3 h-auto">
              Submit Article
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="btn-outline-journal text-base px-6 py-3 h-auto">
              Browse Journals
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl p-4 shadow-card border border-border animate-fade-in"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
