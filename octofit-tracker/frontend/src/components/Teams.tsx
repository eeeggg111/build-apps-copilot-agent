import { CapabilityCard } from './CapabilityCard.js';
import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; members: unknown[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch(() => setError('Unable to load teams'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <CapabilityCard title="Teams" description="Manage teams and members." status="Loading teams..." />;
  if (error) return <div role="alert" className="alert alert-danger">{error}</div>;
  if (teams.length === 0) return <CapabilityCard title="Teams" description="Manage teams and members." status="No teams yet." />;
  return <CapabilityCard title="Teams" description="Manage teams and members." items={teams.map((team) => `${team.name} (${team.members.length} members)`)} />;
}
