import type { Entry } from '../types/leaderboard';

interface LeaderboardTableProps {
    items: Entry[];
    currentPlayerId: string;
}

export function LeaderboardTable({ items, currentPlayerId }: LeaderboardTableProps) {
    if (items.length === 0) {
        return (
            <div className="empty-state">
                Aucun joueur sur cette page (liste vide renvoyée par l'API).
            </div>
        );
    }

    return (
        <table className="leaderboard-table">
            <thead>
                <tr>
                    <th>Rang</th>
                    <th>Joueur</th>
                    <th>Équipe</th>
                    <th className="num">Niveau</th>
                    <th className="num">XP</th>
                </tr>
            </thead>
            <tbody>
                {items.map((entry) => {
                    const isMe = entry.playerId === currentPlayerId;
                    return (
                        <tr key={entry.playerId} className={isMe ? 'current-player-row' : ''}>
                            <td className="rank-cell">{entry.rank}</td>
                            <td className="pseudo-cell">
                                {entry.pseudo}
                                <span className="player-id-badge">{entry.playerId}</span>
                            </td>
                            <td className="team-cell">{entry.team ?? '—'}</td>
                            <td className="num">{entry.level}</td>
                            <td className="num xp-cell">{entry.xp}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}