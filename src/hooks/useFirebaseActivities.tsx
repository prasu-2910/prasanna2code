import { useState, useEffect } from 'react';
import { ref, push, update, remove, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useFirebaseAuth } from './useFirebaseAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export interface Activity {
  id: string;
  user_id: string;
  date: string;
  title: string;
  category: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export const useFirebaseActivities = (selectedDate: Date) => {
  const { user } = useFirebaseAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    const activitiesRef = ref(database, `activities/${user.uid}`);
    
    const unsubscribe = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activitiesList: Activity[] = Object.entries(data)
          .map(([id, value]: [string, any]) => ({
            id,
            ...value,
          }))
          .filter((activity) => activity.date === dateString)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setActivities(activitiesList);
      } else {
        setActivities([]);
      }
      setLoading(false);
    }, (error) => {
      toast({
        title: 'Error fetching activities',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, dateString]);

  const addActivity = async (title: string, category: string, durationMinutes: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const activitiesRef = ref(database, `activities/${user.uid}`);
      const now = new Date().toISOString();
      
      await push(activitiesRef, {
        user_id: user.uid,
        date: dateString,
        title,
        category,
        duration_minutes: durationMinutes,
        created_at: now,
        updated_at: now,
      });

      toast({
        title: 'Activity added',
        description: `${title} has been logged.`,
      });
      return { error: null };
    } catch (error) {
      toast({
        title: 'Error adding activity',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return { error: error as Error };
    }
  };

  const updateActivity = async (id: string, title: string, category: string, durationMinutes: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const activityRef = ref(database, `activities/${user.uid}/${id}`);
      
      await update(activityRef, {
        title,
        category,
        duration_minutes: durationMinutes,
        updated_at: new Date().toISOString(),
      });

      toast({
        title: 'Activity updated',
        description: `${title} has been updated.`,
      });
      return { error: null };
    } catch (error) {
      toast({
        title: 'Error updating activity',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return { error: error as Error };
    }
  };

  const deleteActivity = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const activityRef = ref(database, `activities/${user.uid}/${id}`);
      await remove(activityRef);

      toast({
        title: 'Activity deleted',
        description: 'The activity has been removed.',
      });
      return { error: null };
    } catch (error) {
      toast({
        title: 'Error deleting activity',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return { error: error as Error };
    }
  };

  const totalMinutes = activities.reduce((sum, a) => sum + a.duration_minutes, 0);
  const remainingMinutes = 1440 - totalMinutes;

  return {
    activities,
    loading,
    addActivity,
    updateActivity,
    deleteActivity,
    totalMinutes,
    remainingMinutes,
    refetch: () => {}, // Real-time updates handle this
  };
};
