function getPageItems(currentPage, totalPages) {
    if (totalPages <= 7) {
        return Array.from(
            { length: totalPages },
            (_, index) => index + 1
        );
    }

    const pages = new Set([
        1,
        totalPages,
        currentPage - 1,
        currentPage,
        currentPage + 1,
    ]);

    if (currentPage <= 3) {
        [2, 3, 4, 5].forEach(page => pages.add(page))
    }

    if (currentPage >= totalPages - 2) {
        [
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
        ].forEach(page => pages.add(page));
    }

    const sortedPages = [...pages]
        .filter(page => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b)

    const items = [];

    sortedPages.forEach((page, index) => {
        const previous = sortedPages[index - 1];

        if (index > 0 && page - previous === 2) {
            items.push(previous + 1);
        } else if (index > 0 && page - previous > 2) {
            items.push(`gap-${previous}-${page}`)
        }

        items.push(page);
    });

    return items;
}


export default function DataTable({
    columns,
    rows = [],
    rowKey = 'id',
    loading = false,
    refreshing = false,
    error = '',
    emptyMessage = 'No records found!',
    pagination,
    onPageChange,
    onRefresh,
}) {

    const getRowKey = row =>
        typeof rowKey === 'function' ? rowKey(row) : row[rowKey];

    return (
        <div className="card">
            <div className="card-body">

                {/* refresh button */}
                {onRefresh && (
                    <div className="d-flex justify-content-end mb-3">
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-blue-outline"
                            onClick={onRefresh}
                            disabled={loading || refreshing}
                        >
                            {
                                loading || refreshing ? 'Loading...' : 'Refresh'
                            }
                        </button>
                    </div>
                )}

                {/* display data */}
                {loading ? (
                    <p role="status" className="mb-0">Loading records...</p>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                ) : (
                    <>
                        {rows.length === 0 ? (
                            <p className="text-secondary txt-silver mb-0">{emptyMessage}</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle" aria-busy={refreshing}>
                                    <thead>
                                        <tr>
                                            {columns.map(column => (
                                                <th scope="col" key={column.key}>
                                                    {column.label}
                                                </th>
                                            ))

                                            }
                                        </tr>
                                    </thead>

                                    {/* tbale body */}
                                    <tbody>
                                        {rows.map(row => (
                                            <tr key={getRowKey(row)}>
                                                {
                                                    columns.map(column => (
                                                        <td key={column.key}>
                                                            {
                                                                column.render ? column.render(row) : row[column.key] ?? '—'
                                                            }
                                                        </td>
                                                    ))
                                                }
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {pagination && onPageChange && (
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">

                                {/* records metadata */}
                                <span className="text-secondary txt-silver">
                                    {pagination.total === 0
                                        ? '0 records'
                                        : `Page ${pagination.page} of ${pagination.total_pages} · ${pagination.total} records`
                                    }
                                </span>

                                <nav aria-label="Table Pagination">

                                    <ul className="pagination flex-wrap mb-0">

                                        {/* previos button */}
                                        <li className="page-item">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-silver-outline"
                                                disabled={refreshing || !pagination.has_previous_page}
                                                onClick={() =>
                                                    onPageChange(Math.max(1, pagination.page - 1))
                                                }
                                            >
                                                Previous
                                            </button>
                                        </li>

                                        {/* page nos */}
                                        {getPageItems(
                                            pagination.page,
                                            pagination.total_pages
                                        ).map(item =>
                                            typeof item === 'number' ? (
                                                <li
                                                    key={item}
                                                    className={`page-item mx-1 ${item === pagination.page ? 'active' : ''
                                                        }`}
                                                >
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-blue"
                                                        aria-label={`Go to page ${item}`}
                                                        aria-current={
                                                            item === pagination.page
                                                                ? 'page'
                                                                : undefined
                                                        }
                                                        disabled={
                                                            refreshing ||
                                                            item === pagination.page
                                                        }
                                                        onClick={() => onPageChange(item)}
                                                    >
                                                        {item}
                                                    </button>
                                                </li>
                                            ) : (
                                                <li
                                                    key={item}
                                                    className="page-item disabled"
                                                    aria-hidden="true"
                                                >
                                                    <span className="page-link">…</span>
                                                </li>
                                            )
                                        )}

                                        {/* next button */}
                                        <li className="page-item">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-silver-outline"
                                                disabled={refreshing || !pagination.has_next_page}
                                                onClick={() =>
                                                    onPageChange(pagination.page + 1)
                                                }
                                            >
                                                Next
                                            </button>
                                        </li>

                                    </ul>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

}