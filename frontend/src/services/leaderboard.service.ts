import type { LeaderboardResponse, Period, ApiErrorResponse } from '../types/leaderboard';
import { fetchMockLeaderboard } from '../mocks/leaderboard.mock';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getLeaderboard(
    period: Period,
    page: number,
    pageSize: number,
    token: string
): Promise<LeaderboardResponse> {
    if (USE_MOCK) {
        return fetchMockLeaderboard(period, page, pageSize, token);
    }

    const params = new URLSearchParams({
        period,
        page: String(page),
        pageSize: String(pageSize),
    });

    const response = await fetch(`${API_URL}/api/v1/leaderboard?${params.toString()}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        // Le contrat garantit { error: { code, message } } pour 400, 401, 429
        throw data as ApiErrorResponse;
    }

    return data as LeaderboardResponse;
}