import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Activity } from '@/hooks/useActivities';
import { getCategoryColor, getCategoryIcon, formatMinutesToTime } from '@/lib/categories';
import { Pencil, Trash2 } from 'lucide-react';
import { ActivityForm } from './ActivityForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ActivityListProps {
  activities: Activity[];
  onUpdate: (id: string, title: string, category: string, duration: number) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
  remainingMinutes: number;
  onAdd: (title: string, category: string, duration: number) => Promise<{ error: Error | null }>;
}

export const ActivityList = ({
  activities,
  onUpdate,
  onDelete,
  remainingMinutes,
  onAdd,
}: ActivityListProps) => {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="glass-card p-4 flex items-center justify-between gap-4 opacity-0 animate-fade-in hover-lift"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: `${getCategoryColor(activity.category)}20` }}
            >
              {getCategoryIcon(activity.category)}
            </div>
            <div className="min-w-0">
              <h4 className="font-medium truncate">{activity.title}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: `${getCategoryColor(activity.category)}20`,
                    color: getCategoryColor(activity.category),
                  }}
                >
                  {activity.category}
                </span>
                <span>{formatMinutesToTime(activity.duration_minutes)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingActivity(activity)}
              className="h-9 w-9"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingActivity(activity)}
              className="h-9 w-9 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      {editingActivity && (
        <ActivityForm
          onSubmit={onAdd}
          remainingMinutes={remainingMinutes}
          editActivity={editingActivity}
          onUpdate={onUpdate}
          onClose={() => setEditingActivity(null)}
        />
      )}

      <AlertDialog
        open={!!deletingActivity}
        onOpenChange={(open) => !open && setDeletingActivity(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingActivity?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingActivity) {
                  onDelete(deletingActivity.id);
                  setDeletingActivity(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
