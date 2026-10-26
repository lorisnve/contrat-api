export type Period = 'season' | 'today';

export interface Entry {
  rank: number;
  playerId: string; // pattern: ^p_[0-9]+$
  pseudo: string;
  team: string | null;
  level: number;
  xp: number;
}

export interface LeaderboardResponse {
  period: Period;
  page: number;
  pageSize: number;
  total: number;
  items: Entry[];
}

export type ErrorCode = 'INVALID_PARAMS' | 'INVALID_TOKEN' | 'RATE_LIMITED';

export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
  };
}