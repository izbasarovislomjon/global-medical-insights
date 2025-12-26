import { useState } from 'react';
import { Menu, X, Search, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header-gradient text-primary-foreground sticky top-0 z-50">
      {/* Top bar */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="hidden md:flex items-center gap-4">
            <span className="text-primary-foreground/70">Welcome to IJAMR</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a href="#" className="nav-link flex items-center gap-1.5">
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </a>
            <a href="#" className="nav-link flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Register</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-foreground/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl font-heading font-bold">IJ</span>
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold leading-tight">
                International Journal
              </h1>
              <p className="text-primary-foreground/70 text-sm">
                of Applied Medical Research
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" className="nav-link">Home</a>
            <a href="#journals" className="nav-link">Journals</a>
            <a href="#about" className="nav-link">About Us</a>
            <a href="#submit" className="nav-link">Submit Article</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          {/* Search & Mobile Menu */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-primary-foreground/10 pt-4 space-y-3">
            <a href="#" className="block nav-link py-2">Home</a>
            <a href="#journals" className="block nav-link py-2">Journals</a>
            <a href="#about" className="block nav-link py-2">About Us</a>
            <a href="#submit" className="block nav-link py-2">Submit Article</a>
            <a href="#contact" className="block nav-link py-2">Contact</a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
