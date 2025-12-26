import { FileText, Users, BookOpen, Send, HelpCircle, Globe } from 'lucide-react';

const Sidebar = () => {
  const quickLinks = [
    { icon: FileText, label: 'Mualliflar uchun qo\'llanma', href: '#' },
    { icon: Users, label: 'Taqrizchilar paneli', href: '#' },
    { icon: BookOpen, label: 'Arxiv', href: '#' },
    { icon: Send, label: 'Maqola yuborish', href: '#' },
    { icon: HelpCircle, label: 'Tez-tez so\'raladigan savollar', href: '#' },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'uz', label: 'O\'zbek' },
    { code: 'ru', label: 'Русский' },
    { code: 'ar', label: 'العربية' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
  ];

  return (
    <aside className="space-y-6">
      {/* Quick Links */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card">
        <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Tezkor havolalar
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

      {/* Language Selector */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card">
        <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Til
        </h3>
        <nav className="space-y-1">
          {languages.map((lang) => (
            <a
              key={lang.code}
              href="#"
              className="sidebar-link"
            >
              {lang.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-primary to-journal-blue-light rounded-lg p-5 text-primary-foreground">
        <h3 className="font-heading font-bold mb-4">Statistika</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Jami maqolalar</span>
            <span className="font-bold">2,847</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Mualliflar</span>
            <span className="font-bold">1,523</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Davlatlar</span>
            <span className="font-bold">78</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">O'rtacha IF</span>
            <span className="font-bold">7.5</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
