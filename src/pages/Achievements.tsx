import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getLevelInfo, ALL_BADGES } from '@/lib/bp-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, Award, Star } from 'lucide-react';

export default function AchievementsPage() {
  const { user } = useAuth();
  const [gamification, setGamification] = useState<any>(null);
  const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('user_gamification').select('*').eq('user_id', user.id).single(),
      supabase.from('badges_earned').select('badge_key').eq('user_id', user.id),
    ]).then(([gamRes, badgeRes]) => {
      setGamification(gamRes.data);
      setEarnedKeys(new Set((badgeRes.data || []).map((b: any) => b.badge_key)));
    });
  }, [user]);

  const levelInfo = gamification ? getLevelInfo(gamification.xp) : getLevelInfo(0);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-5">
      <h1 className="text-2xl font-heading">Achievements</h1>

      {/* Level Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-accent">
        <CardContent className="pt-6 pb-5 text-center space-y-3">
          <Star className="h-10 w-10 text-gold mx-auto" />
          <p className="text-lg font-semibold">Level {levelInfo.level}</p>
          <p className="text-2xl font-bold font-heading">{levelInfo.name}</p>
          <div className="space-y-1.5">
            <Progress value={levelInfo.progress} className="h-3 rounded-full" />
            <p className="text-xs text-muted-foreground">{levelInfo.xp} / {levelInfo.nextThreshold} XP</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{gamification?.xp || 0}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{gamification?.streak_days || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <h2 className="text-lg font-heading">Badges</h2>
      <div className="space-y-3">
        {ALL_BADGES.map(badge => {
          const earned = earnedKeys.has(badge.key);
          return (
            <Card key={badge.key} className={`border-0 shadow-md transition-all ${earned ? 'bg-gold/5' : 'opacity-60'}`}>
              <CardContent className="pt-4 pb-4 flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${earned ? 'bg-gold/20' : 'bg-muted'}`}>
                  {earned ? <Trophy className="h-6 w-6 text-gold" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
                {earned && <Award className="h-5 w-5 text-gold ml-auto shrink-0" />}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
