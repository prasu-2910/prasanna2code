import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
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

export const useActivities = (selectedDate: Date) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const fetchActivities = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateString)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Error fetching activities',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, [user, dateString]);

  const addActivity = async (title: string, category: string, durationMinutes: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        date: dateString,
        title,
        category,
        duration_minutes: durationMinutes,
      });

    if (error) {
      toast({
        title: 'Error adding activity',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    await fetchActivities();
    toast({
      title: 'Activity added',
      description: `${title} has been logged.`,
    });
    return { error: null };
  };

  const updateActivity = async (id: string, title: string, category: string, durationMinutes: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('activities')
      .update({
        title,
        category,
        duration_minutes: durationMinutes,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error updating activity',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    await fetchActivities();
    toast({
      title: 'Activity updated',
      description: `${title} has been updated.`,
    });
    return { error: null };
  };

  const deleteActivity = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error deleting activity',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    await fetchActivities();
    toast({
      title: 'Activity deleted',
      description: 'The activity has been removed.',
    });
    return { error: null };
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
    refetch: fetchActivities,
  };
};
