import {
    useEffect,
} from 'react';

import {
    useQuery,
} from '@tanstack/react-query';

import {
    user_role_read,
} from '../../api/user-roles';

import {
    getApiError,
} from '../../api/api-error';

import {
    formatToIST,
} from '../../components/helpers';

import {
    PERMISSIONS,
} from '../../config/permissions';


function formatPermissionLabel(permission) {
    if (permission === PERMISSIONS.ALL) {
        return 'Full access';
    }

    return permission
        .split('.')
        .slice(1)
        .join(' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, character =>
            character.toUpperCase()
        );
}


function formatGroupLabel(group) {
    return group
        .replaceAll('-', ' ')
        .replace(/\b\w/g, character =>
            character.toUpperCase()
        );
}


function groupPermissions(permissions) {
    return permissions.reduce(
        (groups, permission) => {
            const group =
                permission === PERMISSIONS.ALL
                    ? 'administrator'
                    : permission.split('.')[0];

            if (!groups[group]) {
                groups[group] = [];
            }

            groups[group].push(permission);

            return groups;
        },
        {}
    );
}


export default function ViewModal({
    open,
    userRoleId,
    onClose,
}) {
    const roleQuery = useQuery({
        queryKey: [
            'user_role',
            userRoleId,
        ],

        queryFn: () =>
            user_role_read(
                userRoleId
            ),

        enabled:
            open &&
            Boolean(userRoleId),

        retry: false,
        staleTime: 0,
    });

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleKeyDown = event => {
            if (event.key === 'Escape') {
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

    if (!open) {
        return null;
    }

    const role = roleQuery.data;

    const permissions =
        Array.isArray(role?.permissions)
            ? role.permissions
            : [];

    const permissionGroups =
        groupPermissions(permissions);

    const tags =
        Array.isArray(role?.tags)
            ? role.tags
            : [];

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-user-role-title"
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
                            id="view-user-role-title"
                            className="modal-title fs-5"
                        >
                            User Role Details
                        </h2>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </div>

                    <div className="modal-body">
                        {roleQuery.isPending && (
                            <div className="d-flex align-items-center gap-2 py-4">
                                <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                />

                                <span>
                                    Loading user role…
                                </span>
                            </div>
                        )}

                        {roleQuery.isError && (
                            <div className="alert alert-danger mb-0">
                                {
                                    getApiError(
                                        roleQuery.error
                                    ).message
                                }
                            </div>
                        )}

                        {role && (
                            <>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Role Name
                                            </div>

                                            <div className="fw-semibold mt-1">
                                                {role.name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Role Slug
                                            </div>

                                            <div className="font-monospace mt-1">
                                                {role.slug}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Status
                                            </div>

                                            <div className="mt-1">
                                                <span
                                                    className={
                                                        `badge ${
                                                            role.status
                                                                ? 'text-bg-success'
                                                                : 'text-bg-danger'
                                                        }`
                                                    }
                                                >
                                                    {
                                                        role.status
                                                            ? 'Active'
                                                            : 'Inactive'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Created At
                                            </div>

                                            <div className="mt-1">
                                                {
                                                    role.created_at
                                                        ? formatToIST(
                                                            role.created_at
                                                        )
                                                        : '—'
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="border rounded p-3 h-100">
                                            <div className="small text-secondary">
                                                Updated At
                                            </div>

                                            <div className="mt-1">
                                                {
                                                    role.updated_at
                                                        ? formatToIST(
                                                            role.updated_at
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

                                    <div className="border rounded p-3 bg-light">
                                        {
                                            role.remarks ||
                                            'No remarks.'
                                        }
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="h6">
                                        Tags
                                    </h3>

                                    <div className="border rounded p-3">
                                        {tags.length > 0 ? (
                                            tags.map(
                                                (
                                                    tag,
                                                    index
                                                ) => (
                                                    <span
                                                        className="badge rounded-pill bg-blue me-1 mb-1"
                                                        key={`${tag}-${index}`}
                                                    >
                                                        {tag}
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

                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h3 className="h6 mb-0">
                                            Permissions
                                        </h3>

                                        <span className="badge text-bg-secondary">
                                            {
                                                permissions.length
                                            }{' '}
                                            assigned
                                        </span>
                                    </div>

                                    {permissions.length ===
                                    0 ? (
                                        <div className="alert alert-warning mb-0">
                                            This role has no
                                            permissions.
                                        </div>
                                    ) : (
                                        <div className="border rounded p-3">
                                            {Object.entries(
                                                permissionGroups
                                            ).map(
                                                ([
                                                    group,
                                                    groupPermissions,
                                                ]) => (
                                                    <div
                                                        className="mb-4"
                                                        key={
                                                            group
                                                        }
                                                    >
                                                        <h4 className="h6 text-capitalize border-bottom pb-2">
                                                            {
                                                                formatGroupLabel(
                                                                    group
                                                                )
                                                            }
                                                        </h4>

                                                        <div className="row g-2">
                                                            {groupPermissions.map(
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
                                            )}
                                        </div>
                                    )}
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