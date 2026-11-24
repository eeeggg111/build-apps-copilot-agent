import { CapabilityCard } from './CapabilityCard.js';
import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Workout = { title: string; reason?: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    getJson<{ suggestions: Workout[] }>('/api/workouts/suggestions/mona%40example.com')
      .then((data) => setSuggestions(data.suggestions))
      .catch(() => setError('Unable to load workout suggestions'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." status="Loading workout suggestions..." />;
  if (error) return <div role="alert" className="alert alert-danger">{error}</div>;
  if (suggestions.length === 0) return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." status="No workout suggestions yet." />;
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." items={suggestions.map((workout) => workout.reason ? `${workout.title}: ${workout.reason}` : workout.title)} />;
}
