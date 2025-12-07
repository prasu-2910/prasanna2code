import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Clock, LogOut } from 'lucide-react';

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
            <Clock className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold">TimeFlow</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
