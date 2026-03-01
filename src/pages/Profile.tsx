import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [healthContext, setHealthContext] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name || '');
        setAge(data.age?.toString() || '');
        setHealthContext(data.health_context || '');
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      display_name: displayName || null,
      age: age ? parseInt(age) : null,
      health_context: healthContext || null,
    }).eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-5">
      <h1 className="text-2xl font-heading">Profile</h1>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Your Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="rounded-xl bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={displayName} onChange={e => setDisplayName(e.target.value)} className="rounded-xl" placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} className="rounded-xl" placeholder="e.g. 45" min={1} max={150} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="health">Health Notes</Label>
            <Textarea id="health" value={healthContext} onChange={e => setHealthContext(e.target.value)} className="rounded-xl" placeholder="Any relevant health info..." rows={3} />
          </div>
          <Button onClick={handleSave} className="w-full rounded-xl h-11" disabled={loading}>
            <Save className="mr-2 h-4 w-4" /> {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
