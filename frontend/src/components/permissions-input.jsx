import {
    useMemo,
    useState,
} from 'react';

import {
    PERMISSIONS,
    PERMISSION_VALUES,
} from '../config/permissions';


function formatPermissionLabel(permission) {
    if (
        permission ===
        PERMISSIONS.ALL
    ) {
        return 'Full access';
    }

    const action = permission
        .split('.')
        .slice(1)
        .join(' ');

    return action
        .replaceAll('-', ' ')
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );
}


function formatGroupLabel(group) {
    return group
        .replaceAll('-', ' ')
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );
}


export default function PermissionsInput({
    value = [],
    onChange,
    disabled = false,
    error = '',
    allowFullAccess = true,
}) {
    const [
        search,
        setSearch,
    ] = useState('');

    const selectedPermissions =
        Array.isArray(value)
            ? value.filter(
                permission =>
                    allowFullAccess ||
                    permission !==
                        PERMISSIONS.ALL
            )
            : [];

    const hasFullAccess =
        allowFullAccess &&
        selectedPermissions.includes(
            PERMISSIONS.ALL
        );

    const regularPermissions =
        useMemo(
            () =>
                PERMISSION_VALUES.filter(
                    permission =>
                        permission !==
                        PERMISSIONS.ALL
                ),
            []
        );

    const filteredPermissions =
        useMemo(() => {
            const normalizedSearch =
                search
                    .trim()
                    .toLowerCase();

            if (!normalizedSearch) {
                return regularPermissions;
            }

            return regularPermissions.filter(
                permission => {
                    const group =
                        permission.split('.')[0];

                    return (
                        permission
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            ) ||
                        formatPermissionLabel(
                            permission
                        )
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            ) ||
                        formatGroupLabel(group)
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            )
                    );
                }
            );
        }, [
            regularPermissions,
            search,
        ]);

    const permissionGroups =
        useMemo(() => {
            return filteredPermissions.reduce(
                (
                    groups,
                    permission
                ) => {
                    const group =
                        permission.split('.')[0];

                    if (!groups[group]) {
                        groups[group] = [];
                    }

                    groups[group].push(
                        permission
                    );

                    return groups;
                },
                {}
            );
        }, [
            filteredPermissions,
        ]);

    const selectedRegularPermissions =
        selectedPermissions.filter(
            permission =>
                permission !==
                PERMISSIONS.ALL
        );

    const allPermissionsSelected =
        regularPermissions.length > 0 &&
        regularPermissions.every(
            permission =>
                selectedRegularPermissions.includes(
                    permission
                )
        );

    const togglePermission =
        permission => {
            if (disabled) {
                return;
            }

            if (
                permission ===
                PERMISSIONS.ALL
            ) {
                if (!allowFullAccess) {
                    return;
                }

                onChange(
                    hasFullAccess
                        ? []
                        : [
                            PERMISSIONS.ALL,
                        ]
                );

                return;
            }

            if (
                selectedRegularPermissions.includes(
                    permission
                )
            ) {
                onChange(
                    selectedRegularPermissions.filter(
                        selected =>
                            selected !==
                            permission
                    )
                );

                return;
            }

            onChange([
                ...selectedRegularPermissions,
                permission,
            ]);
        };

    const selectAll = () => {
        if (disabled) {
            return;
        }

        onChange([
            ...regularPermissions,
        ]);
    };

    const selectVisible = () => {
        if (disabled) {
            return;
        }

        const permissions =
            new Set([
                ...selectedRegularPermissions,
                ...filteredPermissions,
            ]);

        onChange([
            ...permissions,
        ]);
    };

    const deselectAll = () => {
        if (disabled) {
            return;
        }

        onChange([]);
    };

    return (
        <div>
            <div
                className={
                    `border rounded p-3 ${
                        error
                            ? 'border-danger'
                            : ''
                    }`
                }
            >
                <div className="d-flex flex-wrap gap-2 justify-content-between mb-3">
                    <div className="d-flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            disabled={
                                disabled ||
                                allPermissionsSelected
                            }
                            onClick={selectAll}
                        >
                            Select all
                        </button>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            disabled={
                                disabled ||
                                filteredPermissions
                                    .length === 0
                            }
                            onClick={
                                selectVisible
                            }
                        >
                            Select visible
                        </button>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            disabled={
                                disabled ||
                                selectedPermissions
                                    .length === 0
                            }
                            onClick={
                                deselectAll
                            }
                        >
                            Deselect all
                        </button>
                    </div>

                    <span className="small text-secondary align-self-center">
                        {hasFullAccess
                            ? 'Full access'
                            : `${selectedRegularPermissions.length} selected`}
                    </span>
                </div>

                <div className="mb-3">
                    <input
                        type="search"
                        className="form-control"
                        value={search}
                        disabled={disabled}
                        placeholder="Search permissions..."
                        aria-label="Search permissions"
                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </div>

                {allowFullAccess && (
                    <div className="card mb-3 border-danger-subtle">
                        <div className="card-body py-2">
                            <div className="form-check">
                                <input
                                    id="permission-full-access"
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={
                                        hasFullAccess
                                    }
                                    disabled={
                                        disabled
                                    }
                                    onChange={() =>
                                        togglePermission(
                                            PERMISSIONS.ALL
                                        )
                                    }
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="permission-full-access"
                                >
                                    <strong>
                                        Full access
                                    </strong>

                                    <span className="text-secondary ms-2">
                                        (*)
                                    </span>
                                </label>
                            </div>

                            <div className="small text-secondary mt-1">
                                Grants every current and
                                future permission. Use this
                                only for trusted
                                administrator roles.
                            </div>
                        </div>
                    </div>
                )}

                {hasFullAccess && (
                    <div className="alert alert-warning py-2">
                        Full access is enabled.
                        Individual permissions below are
                        unnecessary.
                    </div>
                )}

                {!hasFullAccess &&
                    Object.entries(
                        permissionGroups
                    ).map(
                        ([
                            group,
                            permissions,
                        ]) => (
                            <div
                                className="mb-4"
                                key={group}
                            >
                                <h3 className="h6 border-bottom pb-2 mb-2">
                                    {
                                        formatGroupLabel(
                                            group
                                        )
                                    }
                                </h3>

                                <div className="row g-2">
                                    {permissions.map(
                                        permission => {
                                            const inputId =
                                                `permission-${permission.replaceAll(
                                                    '.',
                                                    '-'
                                                )}`;

                                            return (
                                                <div
                                                    className="col-md-6 col-xl-4"
                                                    key={
                                                        permission
                                                    }
                                                >
                                                    <div className="form-check">
                                                        <input
                                                            id={
                                                                inputId
                                                            }
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={
                                                                selectedRegularPermissions.includes(
                                                                    permission
                                                                )
                                                            }
                                                            disabled={
                                                                disabled
                                                            }
                                                            onChange={() =>
                                                                togglePermission(
                                                                    permission
                                                                )
                                                            }
                                                        />

                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={
                                                                inputId
                                                            }
                                                            title={
                                                                permission
                                                            }
                                                        >
                                                            {
                                                                formatPermissionLabel(
                                                                    permission
                                                                )
                                                            }

                                                            <div className="small text-secondary">
                                                                {
                                                                    permission
                                                                }
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        )
                    )}

                {!hasFullAccess &&
                    filteredPermissions.length ===
                        0 && (
                        <p className="text-secondary mb-0">
                            No permissions match your
                            search.
                        </p>
                    )}
            </div>

            {error && (
                <div className="text-danger small mt-1">
                    {error}
                </div>
            )}
        </div>
    );
}