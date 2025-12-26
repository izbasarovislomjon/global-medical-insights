import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, User, LogIn, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import SearchDialog from './SearchDialog';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="header-gradient text-primary-foreground sticky top-0 z-50">
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="hidden md:flex items-center gap-4">
            <span className="text-primary-foreground/70">Welcome to IJAMR</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="nav-link flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link to="/my-submissions" className="nav-link flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>My Submissions</span>
                </Link>
                <button onClick={signOut} className="nav-link flex items-center gap-1.5">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="nav-link flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link to="/auth" className="nav-link flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-foreground/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl font-heading font-bold">IJ</span>
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold leading-tight">International Journal</h1>
              <p className="text-primary-foreground/70 text-sm">of Applied Medical Research</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="nav-link">Home</Link>
            <a href="/#journals" className="nav-link">Journals</a>
            <Link to="/submit" className="nav-link">Submit Article</Link>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-primary-foreground/10 pt-4 space-y-3">
            <Link to="/" className="block nav-link py-2">Home</Link>
            <a href="/#journals" className="block nav-link py-2">Journals</a>
            <Link to="/submit" className="block nav-link py-2">Submit Article</Link>
          </nav>
        )}
      </div>

      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
};

export default Header;
