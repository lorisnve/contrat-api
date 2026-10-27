export type Period = 'season' | 'today';

export interface Team {
  teamId: string;
  name: string;
}

export interface Player {
  playerId: string;
  pseudo: string;
  team: Team | null;
  level: number;
  seasonXp: number;
  todayXp: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  pseudo: string;
  team: Team | null;
  level: number;
  xp: number;
}

export interface LeaderboardResponse {
  period: Period;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  total: number;
  items: LeaderboardEntry[];
}

const players: Player[] = [
  { playerId: 'p_1', pseudo: 'Ishak MESSAOUDI', team: null, level: 3, seasonXp: 533, todayXp: 80 },
  { playerId: 'p_2', pseudo: 'Jérémy', team: null, level: 3, seasonXp: 496, todayXp: 45 },
  { playerId: 'p_3', pseudo: 'clément lisnard', team: null, level: 3, seasonXp: 388, todayXp: 0 },
  { playerId: 'p_4', pseudo: 'Rémi', team: null, level: 3, seasonXp: 300, todayXp: 0 },
  { playerId: 'p_5', pseudo: 'Léo', team: null, level: 2, seasonXp: 271, todayXp: 0 },
  { playerId: 'p_6', pseudo: 'Victor', team: null, level: 2, seasonXp: 238, todayXp: 0 },
  { playerId: 'p_7', pseudo: 'Mathias', team: null, level: 2, seasonXp: 226, todayXp: 0 },
  { playerId: 'p_8', pseudo: 'Arthur Courchay', team: null, level: 2, seasonXp: 151, todayXp: 0 },
  { playerId: 'p_9', pseudo: 'Loris', team: null, level: 2, seasonXp: 113, todayXp: 113 },
  { playerId: 'p_10', pseudo: 'Dylan', team: null, level: 1, seasonXp: 0, todayXp: 0 },
  { playerId: 'p_11', pseudo: 'Dylan_Test', team: null, level: 1, seasonXp: 0, todayXp: 0 },
];

const pseudoCollator = new Intl.Collator('fr', { sensitivity: 'accent' });

export function getLeaderboard(
  period: Period,
  page: number,
  pageSize: number,
): LeaderboardResponse {
  const ranked = players
    .map((player) => ({ ...player, xp: period === 'season' ? player.seasonXp : player.todayXp }))
    .sort((a, b) =>
      b.xp - a.xp
      || pseudoCollator.compare(a.pseudo, b.pseudo)
      || a.playerId.localeCompare(b.playerId),
    )
    .map((player, index): LeaderboardEntry => ({
      rank: index + 1,
      playerId: player.playerId,
      pseudo: player.pseudo,
      team: player.team,
      level: player.level,
      xp: player.xp,
    }));

  const start = (page - 1) * pageSize;

  return {
    period,
    page,
    pageSize,
    totalItems: ranked.length,
    totalPages: ranked.length === 0 ? 0 : Math.ceil(ranked.length / pageSize),
    total: ranked.length,
    items: ranked.slice(start, start + pageSize),
  };
}
