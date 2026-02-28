import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { classifyBP, getActivitiesForStage, BPClassification } from '@/lib/bp-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function LogBP() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BPClassification | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);

    if (sys < 60 || sys > 300 || dia < 30 || dia > 200) {
      toast({ title: 'Invalid values', description: 'Please enter realistic BP values.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const classification = classifyBP(sys, dia);

    const { error } = await supabase.from('bp_readings').insert({ user_id: user.id, systolic: sys, diastolic: dia, notes: notes || null });
    if (error) {
      toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Award XP and update streak
    const { data: gamData } = await supabase.from('user_gamification').select('xp, streak_days, last_log_date').eq('user_id', user.id).single();
    if (gamData) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = gamData.last_log_date === yesterday ? gamData.streak_days + 1 : gamData.last_log_date === todayStr ? gamData.streak_days : 1;
      await supabase.from('user_gamification').update({
        xp: gamData.xp + 10,
        streak_days: newStreak,
        last_log_date: todayStr,
      }).eq('user_id', user.id);
    }

    // Generate today's activities if none exist
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase.from('activities').select('id').eq('user_id', user.id).eq('activity_date', today);
    if (!existing || existing.length === 0) {
      const templates = getActivitiesForStage(classification.stage);
      const activities = templates.map(t => ({ user_id: user.id, activity_date: today, title: t.title, description: t.description, category: t.category }));
      await supabase.from('activities').insert(activities);
    }

    // Check for "First Log" badge
    const { count } = await supabase.from('bp_readings').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
    if (count === 1) {
      await supabase.from('badges_earned').insert({
        user_id: user.id, badge_key: 'first_log', badge_name: 'First Log', badge_description: 'Logged your first BP reading',
      });
      toast({ title: '🏆 Badge Earned!', description: 'First Log — You logged your first BP reading!' });
    }

    setResult(classification);
    setLoading(false);
  };

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 space-y-5">
        <Button variant="ghost" onClick={() => navigate('/')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <Card className={`border-0 shadow-xl ${result.bgClass}`}>
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            {result.stage === 'crisis' && <AlertTriangle className="h-12 w-12 text-salmon mx-auto" />}
            {result.stage !== 'crisis' && <Heart className={`h-12 w-12 mx-auto ${result.colorClass}`} />}
            <div>
              <Badge variant="outline" className={`text-base px-4 py-1 ${result.colorClass} border-current`}>{result.label}</Badge>
              <p className="text-3xl font-bold mt-3">{systolic}/{diastolic}</p>
              <p className="text-sm text-muted-foreground mt-1">mmHg</p>
            </div>
            <p className="text-foreground">{result.description}</p>
            <p className="text-sm text-muted-foreground">{result.action}</p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => { setResult(null); setSystolic(''); setDiastolic(''); setNotes(''); }} variant="outline" className="rounded-xl">
            Log Another
          </Button>
          <Button asChild className="rounded-xl">
            <Link to="/activities">View Activities</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-5">
      <Button variant="ghost" onClick={() => navigate('/')} className="pl-0">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary" /> Log Blood Pressure</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systolic">Systolic (top)</Label>
                <Input id="systolic" type="number" placeholder="120" value={systolic} onChange={e => setSystolic(e.target.value)} required min={60} max={300} className="text-center text-xl h-14 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic">Diastolic (bottom)</Label>
                <Input id="diastolic" type="number" placeholder="80" value={diastolic} onChange={e => setDiastolic(e.target.value)} required min={30} max={200} className="text-center text-xl h-14 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" placeholder="e.g., after exercise, before meal..." value={notes} onChange={e => setNotes(e.target.value)} className="rounded-xl" rows={2} />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading}>
              {loading ? 'Saving...' : 'Save Reading'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
