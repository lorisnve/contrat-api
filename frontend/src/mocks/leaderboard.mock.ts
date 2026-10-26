import type { Entry, LeaderboardResponse, Period, ApiErrorResponse } from '../types/leaderboard';

const RAW_SEASON_PLAYERS: Omit<Entry, 'rank'>[] = [
  { playerId: 'p_1', pseudo: 'Ishak MESSAOUDI', team: null, level: 3, xp: 533 },
  { playerId: 'p_2', pseudo: 'Jérémy', team: null, level: 3, xp: 496 },
  { playerId: 'p_3', pseudo: 'clément lisnard', team: null, level: 3, xp: 388 },
  { playerId: 'p_4', pseudo: 'Rémi', team: null, level: 3, xp: 300 },
  { playerId: 'p_5', pseudo: 'Léo', team: null, level: 2, xp: 271 },
  { playerId: 'p_6', pseudo: 'Victor', team: null, level: 2, xp: 238 },
  { playerId: 'p_7', pseudo: 'Mathias', team: null, level: 2, xp: 226 },
  { playerId: 'p_8', pseudo: 'Arthur Courchay', team: null, level: 2, xp: 151 },
  { playerId: 'p_9', pseudo: 'Loris', team: null, level: 2, xp: 113 },
  { playerId: 'p_10', pseudo: 'Dylan', team: null, level: 1, xp: 0 },
  { playerId: 'p_11', pseudo: 'Dylan_Test', team: null, level: 1, xp: 0 },
];

const RAW_TODAY_PLAYERS: Omit<Entry, 'rank'>[] = [
  { playerId: 'p_9', pseudo: 'Loris', team: null, level: 2, xp: 113 },
  { playerId: 'p_1', pseudo: 'Ishak MESSAOUDI', team: null, level: 3, xp: 80 },
  { playerId: 'p_2', pseudo: 'Jérémy', team: null, level: 3, xp: 45 },
  { playerId: 'p_3', pseudo: 'clément lisnard', team: null, level: 3, xp: 0 },
  { playerId: 'p_4', pseudo: 'Rémi', team: null, level: 3, xp: 0 },
  { playerId: 'p_5', pseudo: 'Léo', team: null, level: 2, xp: 0 },
  { playerId: 'p_6', pseudo: 'Victor', team: null, level: 2, xp: 0 },
  { playerId: 'p_7', pseudo: 'Mathias', team: null, level: 2, xp: 0 },
  { playerId: 'p_8', pseudo: 'Arthur Courchay', team: null, level: 2, xp: 0 },
  { playerId: 'p_10', pseudo: 'Dylan', team: null, level: 1, xp: 0 },
  { playerId: 'p_11', pseudo: 'Dylan_Test', team: null, level: 1, xp: 0 },
];

export async function fetchMockLeaderboard(
  period: Period,
  page: number,
  pageSize: number,
  token: string
): Promise<LeaderboardResponse> {
  // Petit délai réseau simulé
  await new Promise((resolve) => setTimeout(resolve, 200));

  // 1. Vérification du token (401 INVALID_TOKEN)
  if (!token || token.trim() === '') {
    const err: ApiErrorResponse = {
      error: { code: 'INVALID_TOKEN', message: 'Token Bearer manquant ou invalide.' },
    };
    throw err;
  }

  // 2. Vérification des paramètres (400 INVALID_PARAMS)
  if (!['season', 'today'].includes(period) || page < 1 || pageSize < 1 || pageSize > 50) {
    const err: ApiErrorResponse = {
      error: {
        code: 'INVALID_PARAMS',
        message: 'Paramètres invalides (page >= 1, pageSize entre 1 et 50, period season|today).',
      },
    };
    throw err;
  }

  const source = period === 'season' ? [...RAW_SEASON_PLAYERS] : [...RAW_TODAY_PLAYERS];

  // 3. Tri : XP décroissant, puis niveau décroissant, puis ordre alphabétique du pseudo
  source.sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (b.level !== a.level) return b.level - a.level;
    return a.pseudo.localeCompare(b.pseudo);
  });

  // 4. Attribution du rang continu avant découpage de la page
  const ranked: Entry[] = source.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));

  // 5. Découpage de la page (renvoie [] si page trop loin, sans erreur)
  const start = (page - 1) * pageSize;
  const items = ranked.slice(start, start + pageSize);

  return {
    period,
    page,
    pageSize,
    total: ranked.length,
    items,
  };
}