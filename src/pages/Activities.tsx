import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Activity, Droplets, Footprints, Salad, Wind, Bed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categoryIcons: Record<string, any> = {
  hydration: Droplets,
  exercise: Footprints,
  diet: Salad,
  relaxation: Wind,
  rest: Bed,
  general: Activity,
};

export default function ActivitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      supabase.from('activities').select('*').eq('user_id', user.id).eq('activity_date', today).order('created_at'),
      supabase.from('activity_completions').select('activity_id, activities!inner(activity_date)').eq('user_id', user.id),
    ]).then(([actRes, compRes]) => {
      setActivities(actRes.data || []);
      const todayCompIds = new Set(
        (compRes.data || []).filter((c: any) => c.activities?.activity_date === today).map((c: any) => c.activity_id)
      );
      setCompletedIds(todayCompIds as Set<string>);
    });
  }, [user]);

  const toggleActivity = async (activityId: string, xpReward: number) => {
    if (!user) return;
    if (completedIds.has(activityId)) {
      await supabase.from('activity_completions').delete().eq('activity_id', activityId).eq('user_id', user.id);
      setCompletedIds(prev => { const n = new Set(prev); n.delete(activityId); return n; });
    } else {
      await supabase.from('activity_completions').insert({ user_id: user.id, activity_id: activityId });
      setCompletedIds(prev => new Set(prev).add(activityId));

      // Award XP
      const { data: gam } = await supabase.from('user_gamification').select('xp').eq('user_id', user.id).single();
      if (gam) {
        let bonus = xpReward;
        // Check if all done for daily bonus
        const newCompleted = completedIds.size + 1;
        if (newCompleted === activities.length) bonus += 25;
        await supabase.from('user_gamification').update({ xp: (gam as any).xp + bonus }).eq('user_id', user.id);
        if (newCompleted === activities.length) {
          toast({ title: '🎉 All Activities Complete!', description: `+${bonus} XP earned (includes daily bonus!)` });
        } else {
          toast({ title: `+${xpReward} XP`, description: 'Activity completed!' });
        }
      }
    }
  };

  const completedCount = completedIds.size;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-5">
      <div>
        <h1 className="text-2xl font-heading">Today's Activities</h1>
        <p className="text-muted-foreground text-sm mt-1">{completedCount}/{activities.length} completed</p>
      </div>

      {activities.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="pt-8 pb-6 text-center">
            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Log a BP reading first to get personalized activities!</p>
          </CardContent>
        </Card>
      )}

      {activities.map((act) => {
        const Icon = categoryIcons[act.category] || Activity;
        const done = completedIds.has(act.id);
        return (
          <Card key={act.id} className={`border-0 shadow-md transition-all ${done ? 'bg-success/5 opacity-80' : ''}`}>
            <CardContent className="pt-4 pb-4 flex items-start gap-3">
              <Checkbox checked={done} onCheckedChange={() => toggleActivity(act.id, act.xp_reward)} className="mt-1" />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${done ? 'line-through text-muted-foreground' : ''}`}>{act.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{act.description}</p>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
