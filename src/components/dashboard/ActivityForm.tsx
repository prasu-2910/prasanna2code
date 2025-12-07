import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CATEGORIES, MINUTES_IN_DAY, formatMinutesToTime } from '@/lib/categories';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Activity } from '@/hooks/useActivities';

interface ActivityFormProps {
  onSubmit: (title: string, category: string, duration: number) => Promise<{ error: Error | null }>;
  remainingMinutes: number;
  editActivity?: Activity | null;
  onUpdate?: (id: string, title: string, category: string, duration: number) => Promise<{ error: Error | null }>;
  onClose?: () => void;
}

export const ActivityForm = ({
  onSubmit,
  remainingMinutes,
  editActivity,
  onUpdate,
  onClose,
}: ActivityFormProps) => {
  const [open, setOpen] = useState(!!editActivity);
  const [title, setTitle] = useState(editActivity?.title || '');
  const [category, setCategory] = useState(editActivity?.category || CATEGORIES[0].name);
  const [hours, setHours] = useState(editActivity ? Math.floor(editActivity.duration_minutes / 60).toString() : '0');
  const [minutes, setMinutes] = useState(editActivity ? (editActivity.duration_minutes % 60).toString() : '30');
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

    const maxAllowed = editActivity
      ? remainingMinutes + editActivity.duration_minutes
      : remainingMinutes;

    if (totalDuration > maxAllowed) {
      toast({
        title: 'Duration exceeds remaining time',
        description: `You only have ${formatMinutesToTime(maxAllowed)} left for this day.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = editActivity && onUpdate
      ? await onUpdate(editActivity.id, title.trim(), category, totalDuration)
      : await onSubmit(title.trim(), category, totalDuration);

    setLoading(false);

    if (!error) {
      setTitle('');
      setCategory(CATEGORIES[0].name);
      setHours('0');
      setMinutes('30');
      setOpen(false);
      onClose?.();
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onClose?.();
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Activity Name</Label>
        <Input
          id="title"
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
          Remaining: {formatMinutesToTime(remainingMinutes + (editActivity?.duration_minutes || 0))}
        </p>
      </div>

      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : editActivity ? (
          'Update Activity'
        ) : (
          'Add Activity'
        )}
      </Button>
    </form>
  );

  if (editActivity) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="gap-2" disabled={remainingMinutes <= 0}>
          <Plus className="w-4 h-4" />
          Add Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log New Activity</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};
