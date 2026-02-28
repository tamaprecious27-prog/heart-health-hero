import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, Scale, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

const ranges = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function HistoryPage() {
  const { user } = useAuth();
  const [bpData, setBpData] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [range, setRange] = useState(7);

  useEffect(() => {
    if (!user) return;
    const since = subDays(new Date(), range).toISOString();

    Promise.all([
      supabase.from('bp_readings').select('*').eq('user_id', user.id).gte('recorded_at', since).order('recorded_at'),
      supabase.from('weight_readings').select('*').eq('user_id', user.id).gte('recorded_at', since).order('recorded_at'),
    ]).then(([bpRes, wRes]) => {
      setBpData((bpRes.data || []).map((r: any) => ({
        date: format(new Date(r.recorded_at), 'MMM d'),
        systolic: r.systolic,
        diastolic: r.diastolic,
      })));
      setWeightData((wRes.data || []).map((r: any) => ({
        date: format(new Date(r.recorded_at), 'MMM d'),
        weight: Number(r.weight_kg),
      })));
    });
  }, [user, range]);

  const avgSys = bpData.length ? Math.round(bpData.reduce((s, d) => s + d.systolic, 0) / bpData.length) : 0;
  const avgDia = bpData.length ? Math.round(bpData.reduce((s, d) => s + d.diastolic, 0) / bpData.length) : 0;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 space-y-5">
      <h1 className="text-2xl font-heading">Health History</h1>

      {/* Range Selector */}
      <div className="flex gap-2">
        {ranges.map(r => (
          <Button key={r.days} variant={range === r.days ? 'default' : 'outline'} size="sm" className="rounded-xl" onClick={() => setRange(r.days)}>
            {r.label}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="bp">
        <TabsList className="grid grid-cols-2 rounded-xl">
          <TabsTrigger value="bp" className="rounded-xl"><Heart className="mr-1.5 h-4 w-4" />Blood Pressure</TabsTrigger>
          <TabsTrigger value="weight" className="rounded-xl"><Scale className="mr-1.5 h-4 w-4" />Weight</TabsTrigger>
        </TabsList>

        <TabsContent value="bp" className="space-y-4 mt-4">
          {bpData.length > 0 && (
            <div className="flex gap-4">
              <Card className="flex-1 border-0 shadow-md">
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-xs text-muted-foreground">Avg Systolic</p>
                  <p className="text-2xl font-bold text-primary">{avgSys}</p>
                </CardContent>
              </Card>
              <Card className="flex-1 border-0 shadow-md">
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-xs text-muted-foreground">Avg Diastolic</p>
                  <p className="text-2xl font-bold text-secondary">{avgDia}</p>
                </CardContent>
              </Card>
            </div>
          )}
          <Card className="border-0 shadow-md">
            <CardContent className="pt-5 pb-3">
              {bpData.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No BP data for this period</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={bpData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="systolic" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} name="Diastolic" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weight" className="space-y-4 mt-4">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-5 pb-3">
              {weightData.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No weight data for this period</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} name="Weight (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
