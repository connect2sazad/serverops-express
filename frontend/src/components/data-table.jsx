import { useMemo, useState, useEffect, useRef } from "react";

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
    tableId,
    columns,
    rows = [],
    rowKey = 'id',
    loading = false,
    refreshing = false,
    error = '',
    emptyMessage = 'No records found!',
    pagination,
    onPageChange,
    pageSize = 10,
    pageSizeOptions = [5, 10, 25, 50, 100],
    onPageSizeChange,
    onRefresh,
    onCreate,
    onSearch,
    searchValue = "",
}) {

    const storageKey = tableId ? `datatable-columns:${tableId}` : null;

    const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);

    const columnsMenuRef = useRef(null);

    const [columnVisibility, setColumnVisibility] = useState(() => {
        const defaults = Object.fromEntries(
            columns.map(column => [
                column.key,
                column.defaultVisible !== false,
            ])
        );

        if (!storageKey) {
            return defaults;
        }

        try {
            const saved = JSON.parse(
                localStorage.getItem(storageKey)
            );

            return {
                ...defaults,
                ...(saved || {}),
            };
        } catch {
            return defaults;
        }
    });

    useEffect(() => {
        if (!columnsMenuOpen) return undefined;

        const handleOutsideClick = event => {
            if (
                columnsMenuRef.current &&
                !columnsMenuRef.current.contains(event.target)
            ) {
                setColumnsMenuOpen(false);
            }
        };

        const handleKeyDown = event => {
            if (event.key === "Escape") {
                setColumnsMenuOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [columnsMenuOpen]);

    useEffect(() => {
        setColumnVisibility(current => {
            const next = {};

            columns.forEach(column => {
                next[column.key] =
                    current[column.key] ??
                    column.defaultVisible !== false;
            });

            return next;
        });
    }, [columns]);

    useEffect(() => {
        if (!storageKey) return;

        localStorage.setItem(
            storageKey,
            JSON.stringify(columnVisibility)
        );
    }, [storageKey, columnVisibility]);

    const visibleColumns = useMemo(
        () =>
            columns.filter(
                column =>
                    columnVisibility[column.key] !== false
            ),
        [columns, columnVisibility]
    );

    const selectAllColumns = () => {
        setColumnVisibility(
            Object.fromEntries(
                columns.map(column => [
                    column.key,
                    true,
                ])
            )
        );
    };

    const deselectAllColumns = () => {
        setColumnVisibility(
            Object.fromEntries(
                columns.map(column => [
                    column.key,
                    column.hideable === false,
                ])
            )
        );
    };

    const resetDefaultColumns = () => {
        setColumnVisibility(
            Object.fromEntries(
                columns.map(column => [
                    column.key,

                    column.hideable === false ||
                    column.defaultVisible !== false,
                ])
            )
        );
    };

    const toggleColumn = key => {
        setColumnVisibility(current => ({
            ...current,
            [key]: !current[key],
        }));
    };

    const getRowKey = row =>
        typeof rowKey === 'function' ? rowKey(row) : row[rowKey];

    return (
        <div className="card">
            <div className="card-body">


                <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
                    <div className="d-flex flex-wrap align-items-end gap-3">
                        {onPageSizeChange && (
                            <div className="form-floating page-size-select">
                                <select
                                    id="table-page-size"
                                    className="form-select"
                                    value={pageSize}
                                    disabled={loading || refreshing}
                                    onChange={event =>
                                        onPageSizeChange(Number(event.target.value))
                                    }
                                >
                                    {pageSizeOptions.map(size => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>

                                <label htmlFor="table-page-size">
                                    Records per page
                                </label>
                            </div>
                        )}

                        {onSearch && (
                            <div className="form-floating">
                                <input
                                    id="table-record-search"
                                    type="search"
                                    className="form-control"
                                    value={searchValue}
                                    placeholder="Search records..."
                                    autoComplete="off"
                                    onChange={event =>
                                        onSearch(event.target.value)
                                    }
                                />

                                <label htmlFor="table-record-search">
                                    Search
                                </label>
                            </div>
                        )}
                    </div>

                    <div>
                        <div
                            ref={columnsMenuRef}
                            className="position-relative d-inline-block mx-1"
                        >
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                aria-expanded={columnsMenuOpen}
                                aria-haspopup="menu"
                                onClick={() =>
                                    setColumnsMenuOpen(open => !open)
                                }
                            >
                                <i className="bi bi-layout-three-columns me-2" />
                                Columns
                            </button>

                            {columnsMenuOpen && (
                                <div
                                    className="dropdown-menu dropdown-menu-end show p-3"
                                    role="menu"
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        left: "auto",
                                        minWidth: "240px",
                                        maxHeight: "360px",
                                        overflowY: "auto",
                                        zIndex: 1050,
                                    }}
                                >
                                    <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                                        <span className="fw-semibold">
                                            Visible columns
                                        </span>

                                        <button
                                            type="button"
                                            className="btn-close"
                                            aria-label="Close columns menu"
                                            onClick={() =>
                                                setColumnsMenuOpen(false)
                                            }
                                        />
                                    </div>

                                    <div className="d-flex gap-2 mb-3">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={selectAllColumns}
                                        >
                                            Select all
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={deselectAllColumns}
                                        >
                                            Deselect all
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={resetDefaultColumns}
                                        >
                                            Default
                                        </button>
                                    </div>

                                    <hr className="my-2" />

                                    {columns.map(column => {
                                        const locked =
                                            column.hideable === false;

                                        return (
                                            <div
                                                key={column.key}
                                                className="form-check mb-2"
                                            >
                                                <input
                                                    id={`${tableId}-${column.key}-visibility`}
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={
                                                        columnVisibility[column.key] !==
                                                        false
                                                    }
                                                    disabled={locked}
                                                    onChange={() =>
                                                        toggleColumn(column.key)
                                                    }
                                                />

                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`${tableId}-${column.key}-visibility`}
                                                >
                                                    {column.label}

                                                    {locked && (
                                                        <small className="text-secondary ms-1">
                                                            (required)
                                                        </small>
                                                    )}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {onCreate && (
                            <button
                                type="button"
                                className="mx-1 btn btn-outline-primary btn-blue-outline"
                                onClick={onCreate}
                            >
                                Create
                            </button>
                        )}

                        {onRefresh && (
                            <button
                                type="button"
                                className="mx-1 btn btn-outline-primary btn-blue-outline"
                                onClick={onRefresh}
                                disabled={loading || refreshing}
                            >
                                {loading || refreshing
                                    ? "Loading..."
                                    : "Refresh"}
                            </button>
                        )}
                    </div>
                </div>

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
                                            {visibleColumns.map(column => (
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
                                                    visibleColumns.map(column => (
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