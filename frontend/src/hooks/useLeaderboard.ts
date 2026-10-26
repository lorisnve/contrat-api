import { useState, useEffect, useCallback } from 'react';
import type { LeaderboardResponse, Period, ApiErrorResponse } from '../types/leaderboard';
import { getLeaderboard } from '../services/leaderboard.service';

const DEFAULT_TOKEN = import.meta.env.VITE_CURRENT_PLAYER_ID || 'p_9';

export function useLeaderboard() {
    const [period, setPeriod] = useState<Period>('season');
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20); // Défaut du contrat : 20
    const [token, setToken] = useState<string>(DEFAULT_TOKEN);

    const [data, setData] = useState<LeaderboardResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<ApiErrorResponse['error'] | null>(null);

    const loadLeaderboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getLeaderboard(period, page, pageSize, token);
            setData(result);
        } catch (err: any) {
            if (err && err.error && err.error.code) {
                setError(err.error);
            } else {
                setError({
                    code: 'INVALID_PARAMS',
                    message: 'Impossible de joindre le serveur API.',
                });
            }
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [period, page, pageSize, token]);

    useEffect(() => {
        loadLeaderboard();
    }, [loadLeaderboard]);

    const handlePeriodChange = (newPeriod: Period) => {
        setPeriod(newPeriod);
        setPage(1); // Retour à la page 1 quand on change d'onglet
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1);
    };

    return {
        period,
        page,
        pageSize,
        token,
        data,
        loading,
        error,
        setPage,
        setToken,
        handlePeriodChange,
        handlePageSizeChange,
        reload: loadLeaderboard,
    };
}