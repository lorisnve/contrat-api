import type { ApiErrorResponse } from '../types/leaderboard';

interface ErrorBannerProps {
    error: ApiErrorResponse['error'];
    onRetry: () => void;
}

export function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
    return (
        <div className="error-banner" role="alert">
            <div>
                <span className="error-code">[{error.code}]</span>
                <span className="error-message">{error.message}</span>
            </div>
            <button type="button" onClick={onRetry} className="btn-retry">
                Réessayer
            </button>
        </div>
    );
}