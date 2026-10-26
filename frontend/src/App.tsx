import { useLeaderboard } from './hooks/useLeaderboard';
import { HeaderTabs } from './components/HeaderTabs';
import { LeaderboardTable } from './components/LeaderboardTable';
import { Pagination } from './components/Pagination';
import { ErrorBanner } from './components/ErrorBanner';
import './App.css';

export function App() {
  const {
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
    reload,
  } = useLeaderboard();

  return (
    <div className="app-container">
      <HeaderTabs period={period} onChange={handlePeriodChange} />

      {error && <ErrorBanner error={error} onRetry={reload} />}

      {loading ? (
        <div className="loading-state">Chargement du classement...</div>
      ) : (
        data && (
          <>
            <LeaderboardTable items={data.items} currentPlayerId={token} />
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )
      )}

      {/* Barre de test du contrat API (super pratique pour la démo avec le back) */}
      <div className="debug-panel">
        <strong>Outils de test du contrat API :</strong>
        <div className="debug-controls">
          <label>
            Bearer Token (joueur connecté) :
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ex: p_9"
            />
          </label>
          <button type="button" onClick={() => setToken('')}>
            Simuler 401 (Token vide)
          </button>
          <button type="button" onClick={() => handlePageSizeChange(999)}>
            Simuler 400 (pageSize = 999 &gt; 50)
          </button>
          <button type="button" onClick={() => setPage(99)}>
            Tester page 99 (Liste vide 200)
          </button>
          <button
            type="button"
            onClick={() => {
              setToken('p_9');
              handlePageSizeChange(20);
              setPage(1);
            }}
          >
            Réinitialiser (Nominal)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;