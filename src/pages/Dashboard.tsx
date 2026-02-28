import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { classifyBP, getLevelInfo, BPClassification } from '@/lib/bp-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Scale, Flame, Trophy, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [gamification, setGamification] = useState<any>(null);
  const [latestBP, setLatestBP] = useState<any>(null);
  const [bpClass, setBpClass] = useState<BPClassification | null>(null);
  const [todayActivities, setTodayActivities] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [recentBadges, setRecentBadges] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('user_gamification').select('*').eq('user_id', user.id).single(),
      supabase.from('bp_readings').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(1),
      supabase.from('activities').select('*').eq('user_id', user.id).eq('activity_date', today),
      supabase.from('activity_completions').select('*, activities!inner(activity_date)').eq('user_id', user.id),
      supabase.from('badges_earned').select('*').eq('user_id', user.id).order('earned_at', { ascending: false }).limit(3),
    ]).then(([profileRes, gamRes, bpRes, actRes, compRes, badgeRes]) => {
      setProfile(profileRes.data);
      setGamification(gamRes.data);
      if (bpRes.data && bpRes.data.length > 0) {
        setLatestBP(bpRes.data[0]);
        setBpClass(classifyBP(bpRes.data[0].systolic, bpRes.data[0].diastolic));
      }
      setTodayActivities(actRes.data || []);
      const todayComps = (compRes.data || []).filter((c: any) => c.activities?.activity_date === today);
      setCompletions(todayComps);
      setRecentBadges(badgeRes.data || []);
    });
  }, [user]);

  const levelInfo = gamification ? getLevelInfo(gamification.xp) : getLevelInfo(0);
  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'there';
  const completedCount = completions.length;
  const totalActivities = todayActivities.length;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading">Hello, {displayName}! 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Level {levelInfo.level} · {levelInfo.name}
        </p>
      </div>

      {/* XP Progress */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-5 pb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-primary" /> {levelInfo.xp} XP</span>
            <span className="text-muted-foreground">Next: {levelInfo.nextThreshold} XP</span>
          </div>
          <Progress value={levelInfo.progress} className="h-3 rounded-full" />
        </CardContent>
      </Card>

      {/* Today's BP */}
      {bpClass && latestBP && (
        <Card className={`border-0 shadow-md ${bpClass.bgClass}`}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Latest Blood Pressure</p>
                <p className="text-3xl font-bold mt-1">{latestBP.systolic}/{latestBP.diastolic}</p>
                <Badge variant="outline" className={`mt-2 ${bpClass.colorClass} border-current`}>{bpClass.label}</Badge>
              </div>
              <Heart className={`h-10 w-10 ${bpClass.colorClass} opacity-50`} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-14 rounded-2xl text-base font-semibold shadow-md" variant="default">
          <Link to="/log-bp"><Heart className="mr-2 h-5 w-5" /> Log BP</Link>
        </Button>
        <Button asChild className="h-14 rounded-2xl text-base font-semibold shadow-md bg-secondary hover:bg-secondary/90" variant="default">
          <Link to="/log-weight"><Scale className="mr-2 h-5 w-5" /> Log Weight</Link>
        </Button>
      </div>

      {/* Activities Summary */}
      {totalActivities > 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Today's Activities</p>
              <Link to="/activities" className="text-sm text-primary font-medium">View all →</Link>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {completedCount}/{totalActivities} completed
            </p>
            <Progress value={totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0} className="h-2 mt-3 rounded-full" />
          </CardContent>
        </Card>
      )}

      {/* Streak & Badges */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-5 pb-4 text-center">
            <Flame className="h-8 w-8 text-warning mx-auto" />
            <p className="text-2xl font-bold mt-1">{gamification?.streak_days || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-5 pb-4 text-center">
            <Trophy className="h-8 w-8 text-gold mx-auto" />
            <p className="text-2xl font-bold mt-1">{recentBadges.length}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
