import { CapabilityCard } from './CapabilityCard.js';
import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then((data) => setEntries(data.leaderboard))
      .catch(() => setError('Unable to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <CapabilityCard title="Leaderboard" description="Compare team point totals." status="Loading leaderboard..." />;
  if (error) return <div role="alert" className="alert alert-danger">{error}</div>;
  if (entries.length === 0) return <CapabilityCard title="Leaderboard" description="Compare team point totals." status="No leaderboard scores yet." />;
  return <CapabilityCard title="Leaderboard" description="Compare team point totals." items={entries.map((entry) => `#${entry.rank} ${entry.teamName} - ${entry.totalPoints}`)} />;
}
