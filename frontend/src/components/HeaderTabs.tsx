import type { Period } from '../types/leaderboard';

interface HeaderTabsProps {
    period: Period;
    onChange: (period: Period) => void;
}

export function HeaderTabs({ period, onChange }: HeaderTabsProps) {
    return (
        <div className="header-bar">
            <h1>Classement</h1>
            <div className="tabs">
                <button
                    type="button"
                    className={period === 'season' ? 'tab active' : 'tab'}
                    onClick={() => onChange('season')}
                >
                    Saison
                </button>
                <button
                    type="button"
                    className={period === 'today' ? 'tab active' : 'tab'}
                    onClick={() => onChange('today')}
                >
                    Aujourd'hui
                </button>
            </div>
        </div>
    );
}