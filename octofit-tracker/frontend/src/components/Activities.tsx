import { CapabilityCard } from './CapabilityCard.js';
import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch(() => setError('Unable to load activities'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <CapabilityCard title="Activities" description="Track student activity minutes and points." status="Loading activities..." />;
  if (error) return <div role="alert" className="alert alert-danger">{error}</div>;
  if (activities.length === 0) return <CapabilityCard title="Activities" description="Track student activity minutes and points." status="No activities yet." />;
  return <CapabilityCard title="Activities" description="Track student activity minutes and points." items={activities.map((activity) => `${activity.type} - ${activity.minutes} minutes - ${activity.points} points`)} />;
}
