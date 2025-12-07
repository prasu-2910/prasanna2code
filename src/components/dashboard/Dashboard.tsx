import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Header } from './Header';
import { DatePicker } from './DatePicker';
import { ProgressRing } from './ProgressRing';
import { ActivityForm } from './ActivityForm';
import { ActivityList } from './ActivityList';
import { NoDataView } from './NoDataView';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { useActivities } from '@/hooks/useActivities';
import { MINUTES_IN_DAY, formatMinutesToTime } from '@/lib/categories';
import { BarChart3, ListTodo, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'log' | 'analytics'>('log');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const {
    activities,
    loading,
    addActivity,
    updateActivity,
    deleteActivity,
    totalMinutes,
    remainingMinutes,
  } = useActivities(selectedDate);

  const canAnalyze = activities.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 opacity-0 animate-fade-in">
          <DatePicker date={selectedDate} onDateChange={setSelectedDate} />

          <div className="flex items-center gap-2">
            <Button
              variant={view === 'log' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('log')}
              className="gap-2"
            >
              <ListTodo className="w-4 h-4" />
              Log
            </Button>
            <Button
              variant={view === 'analytics' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('analytics')}
              disabled={!canAnalyze}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Analyse
            </Button>
          </div>
        </div>

        {view === 'log' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Progress Section */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 flex flex-col items-center opacity-0 animate-fade-in stagger-1">
                <ProgressRing totalMinutes={totalMinutes} />

                <div className="w-full mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Logged</span>
                    <span className="font-medium">{formatMinutesToTime(totalMinutes)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-medium text-primary">
                      {formatMinutesToTime(remainingMinutes)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Activities</span>
                    <span className="font-medium">{activities.length}</span>
                  </div>
                </div>

                <div className="w-full mt-6">
                  {remainingMinutes > 0 ? (
                    <ActivityForm
                      onSubmit={addActivity}
                      remainingMinutes={remainingMinutes}
                    />
                  ) : (
                    <div className="text-center p-4 rounded-xl bg-green-500/10 text-green-600">
                      <p className="font-medium">Day Complete!</p>
                      <p className="text-sm mt-1">All 24 hours logged</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activities Section */}
            <div className="lg:col-span-2 opacity-0 animate-fade-in stagger-2">
              {activities.length === 0 ? (
                <NoDataView
                  date={selectedDate}
                  onAddClick={() => setAddDialogOpen(true)}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-display font-semibold">
                      Today's Activities
                    </h2>
                  </div>
                  <ActivityList
                    activities={activities}
                    onUpdate={updateActivity}
                    onDelete={deleteActivity}
                    remainingMinutes={remainingMinutes}
                    onAdd={addActivity}
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <AnalyticsDashboard activities={activities} totalMinutes={totalMinutes} />
        )}

        {/* Hidden dialog for NoDataView trigger */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Activity</DialogTitle>
            </DialogHeader>
            <ActivityFormContent
              onSubmit={addActivity}
              remainingMinutes={remainingMinutes}
              onClose={() => setAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

// Inline form content for the dialog
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/lib/categories';
import { toast } from '@/hooks/use-toast';

const ActivityFormContent = ({
  onSubmit,
  remainingMinutes,
  onClose,
}: {
  onSubmit: (title: string, category: string, duration: number) => Promise<{ error: Error | null }>;
  remainingMinutes: number;
  onClose: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalDuration = parseInt(hours || '0') * 60 + parseInt(minutes || '0');

    if (!title.trim()) {
      toast({ title: 'Please enter an activity name', variant: 'destructive' });
      return;
    }

    if (totalDuration <= 0) {
      toast({ title: 'Please enter a valid duration', variant: 'destructive' });
      return;
    }

    if (totalDuration > remainingMinutes) {
      toast({
        title: 'Duration exceeds remaining time',
        description: `You only have ${formatMinutesToTime(remainingMinutes)} left.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await onSubmit(title.trim(), category, totalDuration);
    setLoading(false);

    if (!error) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="dialog-title">Activity Name</Label>
        <Input
          id="dialog-title"
          placeholder="What did you do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.name} value={cat.name}>
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Duration</Label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-20"
              />
              <span className="text-muted-foreground">hours</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-20"
              />
              <span className="text-muted-foreground">minutes</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Remaining: {formatMinutesToTime(remainingMinutes)}
        </p>
      </div>

      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Activity'}
      </Button>
    </form>
  );
};
