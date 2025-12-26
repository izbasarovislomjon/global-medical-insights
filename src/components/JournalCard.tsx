import { BookOpen, ArrowRight, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JournalCardProps {
  title: string;
  subtitle: string;
  description: string;
  issn: string;
  impactFactor: string;
  frequency: string;
  imageUrl?: string;
  delay?: number;
}

const JournalCard = ({
  title,
  subtitle,
  description,
  issn,
  impactFactor,
  frequency,
  imageUrl,
  delay = 0,
}: JournalCardProps) => {
  return (
    <article 
      className="journal-card overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-48 lg:w-56 flex-shrink-0">
          <div className="h-48 md:h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-16 h-16 text-primary/40" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge-issn">ISSN: {issn}</span>
            <span className="badge-impact flex items-center gap-1">
              <Award className="w-3 h-3" />
              IF: {impactFactor}
            </span>
          </div>

          <h3 className="font-heading text-lg md:text-xl font-bold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-primary font-medium text-sm mb-3">{subtitle}</p>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{frequency}</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                Current Issue
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1">
                View Journal
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default JournalCard;
