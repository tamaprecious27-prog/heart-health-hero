import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LogWeight() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const w = parseFloat(weight);
    if (w < 20 || w > 500) {
      toast({ title: 'Invalid weight', description: 'Please enter a realistic weight in kg.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('weight_readings').insert({ user_id: user.id, weight_kg: w });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      // Award 5 XP
      const { data: gam } = await supabase.from('user_gamification').select('xp').eq('user_id', user.id).single();
      if (gam) {
        await supabase.from('user_gamification').update({ xp: (gam as any).xp + 5 }).eq('user_id', user.id);
      }
      setSaved(true);
      toast({ title: 'Weight saved!', description: `+5 XP earned` });
    }
    setLoading(false);
  };

  if (saved) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 space-y-5">
        <Card className="border-0 shadow-xl bg-success/10">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <Check className="h-8 w-8 text-success" />
            </div>
            <p className="text-2xl font-bold">{weight} kg</p>
            <p className="text-muted-foreground">Weight logged successfully!</p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => { setSaved(false); setWeight(''); }} variant="outline" className="rounded-xl">Log Another</Button>
          <Button onClick={() => navigate('/')} className="rounded-xl">Dashboard</Button>
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
          <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-secondary" /> Log Weight</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.1" placeholder="70.0" value={weight} onChange={e => setWeight(e.target.value)} required min={20} max={500} className="text-center text-2xl h-16 rounded-xl" />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold bg-secondary hover:bg-secondary/90" disabled={loading}>
              {loading ? 'Saving...' : 'Save Weight'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
