import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface NoDataViewProps {
  date: Date;
  onAddClick: () => void;
}

export const NoDataView = ({ date, onAddClick }: NoDataViewProps) => {
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const dateLabel = isToday ? 'today' : format(date, 'MMMM d');

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center opacity-0 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full gradient-bg flex items-center justify-center animate-float glow-effect">
          <Calendar className="w-16 h-16 text-background" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center shadow-lg">
          <Clock className="w-6 h-6 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-display font-bold mb-2">No activities logged</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        You haven't tracked any activities for {dateLabel} yet.
        Start logging to see how you spend your 24 hours!
      </p>

      <Button variant="gradient" size="lg" onClick={onAddClick} className="gap-2">
        <Plus className="w-5 h-5" />
        Log Your First Activity
      </Button>

      <div className="mt-12 grid grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-3xl font-display font-bold text-primary">24h</div>
          <div className="text-sm text-muted-foreground">Available</div>
        </div>
        <div>
          <div className="text-3xl font-display font-bold text-accent">0</div>
          <div className="text-sm text-muted-foreground">Activities</div>
        </div>
        <div>
          <div className="text-3xl font-display font-bold text-secondary">0%</div>
          <div className="text-sm text-muted-foreground">Tracked</div>
        </div>
      </div>
    </div>
  );
};
