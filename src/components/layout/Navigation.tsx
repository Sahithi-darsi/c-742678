
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Home,
  Mic,
  Settings,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { EchoLogo } from './EchoLogo';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavLink = ({ to, icon, label, onClick }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    setSheetOpen(false);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setSheetOpen(false);
    }
  };

  // Desktop navigation
  if (!isMobile) {
    return (
      <nav className="fixed w-64 inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-border p-4">
        <div className="flex flex-col h-full">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2">
              <EchoLogo />
              <span className="text-2xl font-serif font-bold">EchoVerse</span>
            </Link>
          </div>
          
          <div className="space-y-1">
            <NavLink to="/" icon={<Home size={20} />} label="Timeline" />
            <NavLink to="/record" icon={<Mic size={20} />} label="Record Entry" />
            <NavLink to="/settings" icon={<Settings size={20} />} label="Settings" />
            <NavLink to="/profile" icon={<User size={20} />} label="Profile" />
          </div>
          
          <div className="mt-auto pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-2" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  // Mobile navigation
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-900 border-b border-border flex items-center justify-between px-4 z-10">
        <Link to="/" className="flex items-center gap-2">
          <EchoLogo size={24} />
          <span className="text-xl font-serif font-bold">EchoVerse</span>
        </Link>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu size={24} />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px]">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <EchoLogo />
                <span>EchoVerse</span>
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-2">
              <NavLink 
                to="/" 
                icon={<Home size={20} />} 
                label="Timeline"
                onClick={handleLinkClick}
              />
              <NavLink 
                to="/record" 
                icon={<Mic size={20} />} 
                label="Record Entry"
                onClick={handleLinkClick}
              />
              <NavLink 
                to="/settings" 
                icon={<Settings size={20} />} 
                label="Settings"
                onClick={handleLinkClick}
              />
              <NavLink 
                to="/profile" 
                icon={<User size={20} />} 
                label="Profile"
                onClick={handleLinkClick}
              />
            </div>
            
            <div className="mt-8 pt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut size={20} className="mr-2" />
                <span>Sign Out</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
      <div className="h-14" /> {/* Spacer for fixed header */}
    </>
  );
}
