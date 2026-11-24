import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isObject(input)) throw httpError(400, 'Invalid activity');
  const { userId, teamId, type, minutes } = input;
  if (
    typeof userId !== 'string'
    || typeof teamId !== 'string'
    || typeof type !== 'string'
    || type.trim() === ''
    || typeof minutes !== 'number'
    || !Number.isFinite(minutes)
    || minutes < 1
  ) {
    throw httpError(400, 'Invalid activity');
  }
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw httpError(400, 'Invalid user or team ID');
  }
  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);
  if (!user) throw httpError(404, 'User not found');
  if (!team) throw httpError(404, 'Team not found');
  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isObject(input) || typeof input.name !== 'string' || input.name.trim() === '') {
    throw httpError(400, 'Team name is required');
  }
  if (typeof input.mascot !== 'string' || input.mascot.trim() === '') {
    throw httpError(400, 'Team mascot is required');
  }
  const memberIds = Array.isArray(input.members)
    ? input.members.filter((id): id is string => typeof id === 'string' && mongoose.isValidObjectId(id))
    : [];
  const team = await Team.create({
    name: input.name.trim(),
    mascot: input.mascot.trim(),
    members: memberIds,
  });
  await User.updateMany({ _id: { $in: memberIds } }, { $set: { team: team._id } });
  return team;
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  totals.sort((a, b) => b.totalPoints - a.totalPoints);
  const teamIds = totals.map((entry) => entry._id);
  const teams = await Team.find({ _id: { $in: teamIds } }).lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));
  return totals.map((entry, index) => ({
    teamName: teamNames.get(entry._id.toString()) ?? 'Unknown team',
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw httpError(404, 'User not found');
  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean();
  const activityTypes = recentActivities.map((activity) => activity.type);
  const goal = typeof user.fitnessGoal === 'string' ? user.fitnessGoal : '';
  const focus = goal || activityTypes[0] || '';
  const workouts = await Workout.find({
    $or: [
      ...(focus ? [{ focus: { $regex: `^${focus}$`, $options: 'i' } }] : []),
      ...(activityTypes.length ? [{ focus: { $in: activityTypes } }] : []),
    ],
  }).lean();
  const matching = workouts.find((workout) =>
    typeof workout.focus === 'string'
    && (workout.focus.toLowerCase() === focus.toLowerCase()
      || activityTypes.some((type) => type.toLowerCase() === workout.focus?.toLowerCase())),
  ) ?? workouts[0];
  if (!matching) return [];
  const reason = activityTypes.length
    ? `Recommended for your recent ${activityTypes[0]} activity and ${goal || 'fitness'} goal.`
    : `Recommended to support your ${goal || 'fitness'} goal.`;
  return [{ ...matching, reason }];
}

export { User };
