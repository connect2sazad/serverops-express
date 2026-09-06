import {
    useEffect,
    useMemo,
} from 'react';

import {
    useQuery,
} from '@tanstack/react-query';

import {
    getApiError,
} from '../../api/api-error';

import {
    user_read,
} from '../../api/users';

import {
    formatToIST,
} from '../../components/helpers';

import {
    PERMISSIONS,
} from '../../config/permissions';


function formatPermissionLabel(permission) {
    if (
        permission ===
        PERMISSIONS.ALL
    ) {
        return 'Full access';
    }

    return permission
        .split('.')
        .slice(1)
        .join(' ')
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


function groupPermissions(permissions) {
    return permissions.reduce(
        (
            groups,
            permission
        ) => {
            const group =
                permission ===
                PERMISSIONS.ALL
                    ? 'administrator'
                    : permission.split('.')[0];

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
}


function PermissionGroups({
    permissions,
    emptyMessage,
}) {
    if (
        permissions.length === 0
    ) {
        return (
            <div className="text-secondary">
                {emptyMessage}
            </div>
        );
    }

    const groups =
        groupPermissions(
            permissions
        );

    return Object.entries(
        groups
    ).map(
        ([
            group,
            groupPermissionsList,
        ]) => (
            <div
                className="mb-3"
                key={group}
            >
                <h4 className="h6 border-bottom pb-2">
                    {
                        formatGroupLabel(
                            group
                        )
                    }
                </h4>

                <div className="row g-2">
                    {groupPermissionsList.map(
                        permission => (
                            <div
                                className="col-md-6 col-xl-4"
                                key={
                                    permission
                                }
                            >
                                <div className="border rounded p-2 h-100">
                                    <div className="fw-semibold">
                                        {
                                            formatPermissionLabel(
                                                permission
                                            )
                                        }
                                    </div>

                                    <div className="small text-secondary font-monospace text-break">
                                        {
                                            permission
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        )
    );
}


export default function ViewModal({
    open,
    userId,
    onClose,
}) {
    const userQuery = useQuery({
        queryKey: [
            'user',
            userId,
        ],

        queryFn: () =>
            user_read(userId),

        enabled:
            open &&
            Boolean(userId),

        retry:
            false,

        staleTime:
            0,
    });

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleKeyDown =
            event => {
                if (
                    event.key ===
                    'Escape'
                ) {
                    onClose();
                }
            };

        document.body.classList.add(
            'modal-open'
        );

        window.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.body.classList.remove(
                'modal-open'
            );

            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [
        open,
        onClose,
    ]);

    const user =
        userQuery.data;

    const rolePermissions =
        useMemo(
            () =>
                Array.isArray(
                    user?.role?.permissions
                )
                    ? user.role.permissions
                    : [],
            [
                user,
            ]
        );

    const individualPermissions =
        useMemo(
            () =>
                Array.isArray(
                    user
                        ?.individual_permissions
                )
                    ? user
                        .individual_permissions
                    : [],
            [
                user,
            ]
        );

    const effectivePermissions =
        useMemo(() => {
            if (
                rolePermissions.includes(
                    PERMISSIONS.ALL
                )
            ) {
                return [
                    PERMISSIONS.ALL,
                ];
            }

            return [
                ...new Set([
                    ...rolePermissions,
                    ...individualPermissions,
                ]),
            ].sort();
        }, [
            rolePermissions,
            individualPermissions,
        ]);

    if (!open) {
        return null;
    }

    const tags =
        Array.isArray(user?.tags)
            ? user.tags
            : [];

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-user-title"
            style={{
                backgroundColor:
                    'rgba(0, 0, 0, 0.5)',
            }}
            onMouseDown={event => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
                <div className="modal-content shadow">
                    <div className="modal-header">
                        <h2
                            id="view-user-title"
                            className="modal-title fs-5"
                        >
                            User Details
                        </h2>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </div>

                    <div className="modal-body">
                        {userQuery.isPending && (
                            <div className="d-flex align-items-center gap-2 py-4">
                                <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                />

                                <span>
                                    Loading user…
                                </span>
                            </div>
                        )}

                        {userQuery.isError && (
                            <div className="alert alert-danger mb-0">
                                {
                                    getApiError(
                                        userQuery.error
                                    ).message
                                }
                            </div>
                        )}

                        {user && (
                            <>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6 col-xl-4">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Name
                                            </div>

                                            <div className="fw-semibold mt-1">
                                                {
                                                    user.name
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-xl-4">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                User ID
                                            </div>

                                            <div className="font-monospace mt-1">
                                                @
                                                {
                                                    user.userid
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-xl-4">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Email
                                            </div>

                                            <div className="mt-1 text-break">
                                                {
                                                    user.email
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-xl-4">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Role
                                            </div>

                                            <div className="fw-semibold mt-1">
                                                {
                                                    user.role
                                                        ?.name ??
                                                    'No role'
                                                }
                                            </div>

                                            <div className="small text-secondary font-monospace">
                                                {
                                                    user.role
                                                        ?.slug ??
                                                    '—'
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-xl-4">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Status
                                            </div>

                                            <div className="mt-1">
                                                <span
                                                    className={
                                                        `badge ${
                                                            user.status
                                                                ? 'text-bg-success'
                                                                : 'text-bg-danger'
                                                        }`
                                                    }
                                                >
                                                    {user.status
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-xl-4">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                User Number
                                            </div>

                                            <div className="mt-1">
                                                #
                                                {
                                                    user.id
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Created At
                                            </div>

                                            <div className="mt-1">
                                                {
                                                    user.created_at
                                                        ? formatToIST(
                                                            user.created_at
                                                        )
                                                        : '—'
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Updated At
                                            </div>

                                            <div className="mt-1">
                                                {
                                                    user.updated_at
                                                        ? formatToIST(
                                                            user.updated_at
                                                        )
                                                        : '—'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="h6">
                                        Remarks
                                    </h3>

                                    <div className="border rounded bg-light p-3">
                                        {
                                            user.remarks ||
                                            'No remarks.'
                                        }
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="h6">
                                        Tags
                                    </h3>

                                    <div className="border rounded p-3">
                                        {tags.length >
                                        0 ? (
                                            tags.map(
                                                (
                                                    tag,
                                                    index
                                                ) => (
                                                    <span
                                                        className="badge rounded-pill bg-blue me-1 mb-1"
                                                        key={`${tag}-${index}`}
                                                    >
                                                        {
                                                            tag
                                                        }
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <span className="text-secondary">
                                                No tags.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h3 className="h6 mb-0">
                                            Role Permissions
                                        </h3>

                                        <span className="badge text-bg-secondary">
                                            {
                                                rolePermissions
                                                    .length
                                            }
                                        </span>
                                    </div>

                                    <div className="border rounded p-3">
                                        <PermissionGroups
                                            permissions={
                                                rolePermissions
                                            }
                                            emptyMessage="The assigned role has no permissions."
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h3 className="h6 mb-0">
                                            Individual Permissions
                                        </h3>

                                        <span className="badge text-bg-secondary">
                                            {
                                                individualPermissions
                                                    .length
                                            }
                                        </span>
                                    </div>

                                    <div className="border rounded p-3">
                                        <PermissionGroups
                                            permissions={
                                                individualPermissions
                                            }
                                            emptyMessage="No individual permissions are assigned."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h3 className="h6 mb-0">
                                            Effective Permissions
                                        </h3>

                                        <span className="badge text-bg-primary">
                                            {
                                                effectivePermissions
                                                    .length
                                            }
                                        </span>
                                    </div>

                                    <div className="alert alert-info py-2">
                                        Effective permissions
                                        combine the assigned
                                        role and individual
                                        permissions.
                                    </div>

                                    <div className="border rounded p-3">
                                        <PermissionGroups
                                            permissions={
                                                effectivePermissions
                                            }
                                            emptyMessage="This user has no effective permissions."
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary btn-blue"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}