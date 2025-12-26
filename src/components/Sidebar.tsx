import { FileText, Users, BookOpen, Send, HelpCircle } from 'lucide-react';

const Sidebar = () => {
  const quickLinks = [
    { icon: FileText, label: 'Author Guidelines', href: '#' },
    { icon: Users, label: 'Reviewer Panel', href: '#' },
    { icon: BookOpen, label: 'Archive', href: '#' },
    { icon: Send, label: 'Submit Article', href: '#' },
    { icon: HelpCircle, label: 'FAQ', href: '#' },
  ];

  return (
    <aside className="space-y-6">
      {/* Quick Links */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card">
        <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Quick Links
        </h3>
        <nav className="space-y-1">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="sidebar-link flex items-center gap-3"
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-primary to-journal-blue-light rounded-lg p-5 text-primary-foreground">
        <h3 className="font-heading font-bold mb-4">Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Total Articles</span>
            <span className="font-bold">2,847</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Authors</span>
            <span className="font-bold">1,523</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Countries</span>
            <span className="font-bold">78</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Avg. Impact Factor</span>
            <span className="font-bold">7.5</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
