interface PaginationProps {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (newPage: number) => void;
    onPageSizeChange: (newSize: number) => void;
}

export function Pagination({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="pagination-bar">
            <div className="pagination-info">
                Total : <strong>{total}</strong> joueurs | Page <strong>{page}</strong> sur{' '}
                <strong>{totalPages}</strong>
            </div>

            <div className="pagination-controls">
                <label>
                    Par page :
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        <option value={5}>5 (test pagination)</option>
                        <option value={10}>10</option>
                        <option value={20}>20 (défaut contrat)</option>
                        <option value={50}>50 (max contrat)</option>
                    </select>
                </label>

                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    ← Précédent
                </button>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    title="Le contrat autorise d'aller au-delà pour tester le retour d'une liste vide"
                >
                    Suivant →
                </button>
            </div>
        </div>
    );
}