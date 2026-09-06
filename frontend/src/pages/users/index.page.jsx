import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import {
    toast,
} from 'react-toastify';

import DataTable from
    '../../components/data-table';

import {
    formatToIST,
} from '../../components/helpers';

import {
    getApiError,
} from '../../api/api-error';

import {
    user_create,
    user_delete,
    user_list,
    user_set_status,
    user_update,
    user_update_permissions,
} from '../../api/users';

import {
    PERMISSIONS,
} from '../../config/permissions';

import {
    useAuth,
} from '../../hooks/useAuth';

import useConfirmation from
    '../../hooks/useConfirmation';

import CreateModal from
    './create.modal';

import EditModal from
    './edit.modal';

import PermissionsModal from
    './permissions.modal';

import ViewModal from
    './view.modal';


function createColumns({
    hasPermission,
    currentUserId,
    onView,
    onEdit,
    onPermissions,
    onDelete,
    onStatusChange,
    deletingId,
    statusPendingId,
}) {
    return [
        {
            key: 'serial_number',
            label: 'Sl. No.',
            hideable: false,
        },

        {
            key: 'name',
            label: 'User',
            hideable: false,

            render: user => (
                <div>
                    <div className="fw-semibold">
                        {user.name}
                    </div>

                    <div className="small text-secondary font-monospace">
                        @{user.userid}
                    </div>
                </div>
            ),
        },

        {
            key: 'email',
            label: 'Email',
            hideable: false,

            render: user => (
                <span className="text-break">
                    {user.email}
                </span>
            ),
        },

        {
            key: 'role',
            label: 'Role',

            render: user => (
                <div>
                    <div>
                        {user.role?.name ?? '—'}
                    </div>

                    {user.role?.slug && (
                        <div className="small text-secondary font-monospace">
                            {user.role.slug}
                        </div>
                    )}
                </div>
            ),
        },

        {
            key: 'individual_permissions',
            label: 'Individual Permissions',

            render: user => {
                const permissions =
                    Array.isArray(
                        user.individual_permissions
                    )
                        ? user.individual_permissions
                        : [];

                return (
                    <span className="badge text-bg-secondary">
                        {permissions.length}{' '}
                        assigned
                    </span>
                );
            },
        },

        {
            key: 'remarks',
            label: 'Remarks',
            defaultVisible: false,

            render: user =>
                user.remarks || '—',
        },

        {
            key: 'tags',
            label: 'Tags',
            defaultVisible: false,

            render: user => {
                const tags =
                    Array.isArray(user.tags)
                        ? user.tags
                        : [];

                if (tags.length === 0) {
                    return '—';
                }

                return tags.map(
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
                );
            },
        },

        {
            key: 'created_at',
            label: 'Created At',
            defaultVisible: false,

            render: user =>
                user.created_at
                    ? formatToIST(
                        user.created_at
                    )
                    : '—',
        },

        {
            key: 'updated_at',
            label: 'Updated At',
            defaultVisible: false,

            render: user =>
                user.updated_at
                    ? formatToIST(
                        user.updated_at
                    )
                    : '—',
        },

        {
            key: 'status',
            label: 'Status',

            render: user => {
                const isCurrentUser =
                    Number(user.id) ===
                    Number(currentUserId);

                if (
                    !hasPermission(
                        PERMISSIONS.USERS_STATUS
                    )
                ) {
                    return (
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
                    );
                }

                return (
                    <div>
                        <div className="form-check form-switch mb-0">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                role="switch"
                                checked={
                                    Boolean(
                                        user.status
                                    )
                                }
                                disabled={
                                    isCurrentUser ||
                                    statusPendingId !==
                                        null
                                }
                                aria-label={
                                    user.status
                                        ? `Disable ${user.name}`
                                        : `Enable ${user.name}`
                                }
                                onChange={() =>
                                    onStatusChange(
                                        user,
                                        !user.status
                                    )
                                }
                            />

                            {statusPendingId ===
                                user.id && (
                                <span className="small ms-2">
                                    Updating…
                                </span>
                            )}
                        </div>

                        {isCurrentUser && (
                            <div className="small text-secondary">
                                Current account
                            </div>
                        )}
                    </div>
                );
            },
        },

        {
            key: 'actions',
            label: 'Actions',
            hideable: false,

            render: user => {
                const isCurrentUser =
                    Number(user.id) ===
                    Number(currentUserId);

                return (
                    <div className="d-flex flex-wrap gap-1">
                        {hasPermission(
                            PERMISSIONS.USERS_READ
                        ) && (
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary btn-blue"
                                onClick={() =>
                                    onView(user)
                                }
                            >
                                <i className="bi bi-eye me-1" />

                                View
                            </button>
                        )}

                        {hasPermission(
                            PERMISSIONS.USERS_UPDATE
                        ) && (
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary btn-blue"
                                onClick={() =>
                                    onEdit(user)
                                }
                            >
                                <i className="bi bi-pencil me-1" />

                                Edit
                            </button>
                        )}

                        {hasPermission(
                            PERMISSIONS.USERS_PERMISSIONS_UPDATE
                        ) && (
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                    onPermissions(
                                        user
                                    )
                                }
                            >
                                <i className="bi bi-shield-check me-1" />

                                Permissions
                            </button>
                        )}

                        {hasPermission(
                            PERMISSIONS.USERS_DELETE
                        ) && (
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary btn-red"
                                disabled={
                                    isCurrentUser ||
                                    deletingId !==
                                        null
                                }
                                title={
                                    isCurrentUser
                                        ? 'You cannot delete your own account.'
                                        : undefined
                                }
                                onClick={() =>
                                    onDelete(user)
                                }
                            >
                                <i className="bi bi-trash me-1" />

                                {deletingId ===
                                user.id
                                    ? 'Removing…'
                                    : 'Remove'}
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];
}


export default function UsersPage() {
    const {
        user: authenticatedUser,
        hasPermission,
    } = useAuth();

    const {
        confirm,
    } = useConfirmation();

    const queryClient =
        useQueryClient();

    const [
        page,
        setPage,
    ] = useState(1);

    const [
        pageSize,
        setPageSize,
    ] = useState(10);

    const [
        search,
        setSearch,
    ] = useState('');

    const [
        debouncedSearch,
        setDebouncedSearch,
    ] = useState('');

    const [
        createOpen,
        setCreateOpen,
    ] = useState(false);

    const [
        viewUser,
        setViewUser,
    ] = useState(null);

    const [
        editUser,
        setEditUser,
    ] = useState(null);

    const [
        permissionsUser,
        setPermissionsUser,
    ] = useState(null);

    useEffect(() => {
        document.title =
            'Users | ServerOps';
    }, []);

    useEffect(() => {
        const timer =
            setTimeout(
                () => {
                    setDebouncedSearch(
                        search.trim()
                    );

                    setPage(1);
                },
                400
            );

        return () =>
            clearTimeout(timer);
    }, [
        search,
    ]);

    const listQuery = useQuery({
        queryKey: [
            'users',
            page,
            pageSize,
            debouncedSearch,
        ],

        queryFn: () =>
            user_list({
                page,
                page_size: pageSize,
                search:
                    debouncedSearch,
            }),

        retry:
            false,

        staleTime:
            0,
    });

    const pagination =
        listQuery.data?.pagination;

    const rows = useMemo(() => {
        const records =
            listQuery.data?.data ??
            [];

        const currentPage =
            pagination?.page ??
            page;

        const currentPageSize =
            pagination?.page_size ??
            pageSize;

        const start =
            (
                currentPage - 1
            ) * currentPageSize;

        return records.map(
            (
                user,
                index
            ) => ({
                ...user,

                serial_number:
                    start +
                    index +
                    1,
            })
        );
    }, [
        listQuery.data?.data,
        pagination?.page,
        pagination?.page_size,
        page,
        pageSize,
    ]);

    const invalidateUsers = () =>
        queryClient.invalidateQueries({
            queryKey: [
                'users',
            ],
        });

    const createMutation =
        useMutation({
            mutationFn:
                user_create,

            onSuccess: async response => {
                setCreateOpen(false);
                setPage(1);

                await invalidateUsers();

                toast.success(
                    response?.message ??
                    'User created successfully.'
                );
            },

            onError: error => {
                toast.error(
                    getApiError(
                        error
                    ).message
                );
            },
        });

    const updateMutation =
        useMutation({
            mutationFn: ({
                id,
                values,
            }) =>
                user_update(
                    id,
                    values
                ),

            onSuccess: async response => {
                const updatedUserId =
                    editUser?.id;

                setEditUser(null);

                await invalidateUsers();

                if (updatedUserId) {
                    await queryClient
                        .invalidateQueries({
                            queryKey: [
                                'user',
                                updatedUserId,
                            ],
                        });
                }

                toast.success(
                    response?.message ??
                    'User updated successfully.'
                );
            },

            onError: error => {
                toast.error(
                    getApiError(
                        error
                    ).message
                );
            },
        });

    const permissionsMutation =
        useMutation({
            mutationFn: ({
                id,
                permissions,
            }) =>
                user_update_permissions(
                    id,
                    permissions
                ),

            onSuccess: async response => {
                const updatedUserId =
                    permissionsUser?.id;

                setPermissionsUser(null);

                await invalidateUsers();

                if (updatedUserId) {
                    await queryClient
                        .invalidateQueries({
                            queryKey: [
                                'user',
                                updatedUserId,
                            ],
                        });
                }

                toast.success(
                    response?.message ??
                    'Individual permissions updated successfully.'
                );

                if (
                    Number(
                        updatedUserId
                    ) ===
                    Number(
                        authenticatedUser?.id
                    )
                ) {
                    toast.info(
                        'Sign in again to refresh your effective permissions.'
                    );
                }
            },

            onError: error => {
                toast.error(
                    getApiError(
                        error
                    ).message
                );
            },
        });

    const statusMutation =
        useMutation({
            mutationFn: ({
                id,
                enabled,
            }) =>
                user_set_status(
                    id,
                    enabled
                ),

            onSuccess: async response => {
                await invalidateUsers();

                toast.success(
                    response?.message ??
                    'User status updated successfully.'
                );
            },

            onError: error => {
                toast.error(
                    getApiError(
                        error
                    ).message
                );
            },
        });

    const deleteMutation =
        useMutation({
            mutationFn:
                user_delete,

            onSuccess: async response => {
                if (
                    rows.length === 1 &&
                    page > 1
                ) {
                    setPage(
                        previousPage =>
                            previousPage - 1
                    );
                }

                await invalidateUsers();

                toast.success(
                    response?.message ??
                    'User removed successfully.'
                );
            },

            onError: error => {
                toast.error(
                    getApiError(
                        error
                    ).message
                );
            },
        });

    const handleStatusChange =
        async (
            user,
            enabled
        ) => {
            const {
                confirmed,
            } = await confirm({
                title:
                    `${enabled
                        ? 'Enable'
                        : 'Disable'} user?`,

                message: (
                    <>
                        Do you want to{' '}
                        <strong>
                            {enabled
                                ? 'enable'
                                : 'disable'}
                        </strong>{' '}
                        <strong>
                            {user.name}
                        </strong>
                        ?
                    </>
                ),

                confirmLabel:
                    enabled
                        ? 'Enable'
                        : 'Disable',

                variant:
                    enabled
                        ? 'primary'
                        : 'warning',
            });

            if (confirmed) {
                statusMutation.mutate({
                    id:
                        user.id,

                    enabled,
                });
            }
        };

    const handleDelete =
        async user => {
            const {
                confirmed,
            } = await confirm({
                title:
                    'Remove user?',

                message: (
                    <>
                        You are about to remove{' '}
                        <strong>
                            {user.name}
                        </strong>
                        .
                        <br />
                        This account will no
                        longer be able to access
                        ServerOps.
                    </>
                ),

                confirmLabel:
                    'Remove',

                variant:
                    'danger',

                input: {
                    label: (
                        <>
                            Type{' '}
                            <strong>
                                {user.userid}
                            </strong>{' '}
                            to confirm:
                        </>
                    ),

                    validationLabel:
                        'User ID',

                    placeholder:
                        user.userid,

                    required:
                        true,

                    maxLength:
                        user.userid.length,

                    validate:
                        value =>
                            value ===
                                user.userid ||
                            'The User ID does not match.',
                },
            });

            if (confirmed) {
                deleteMutation.mutate(
                    user.id
                );
            }
        };

    const columns =
        createColumns({
            hasPermission,

            currentUserId:
                authenticatedUser?.id,

            onView:
                setViewUser,

            onEdit:
                user => {
                    updateMutation.reset();

                    setEditUser(user);
                },

            onPermissions:
                user => {
                    permissionsMutation
                        .reset();

                    setPermissionsUser(
                        user
                    );
                },

            onDelete:
                handleDelete,

            onStatusChange:
                handleStatusChange,

            deletingId:
                deleteMutation.isPending
                    ? deleteMutation
                        .variables
                    : null,

            statusPendingId:
                statusMutation.isPending
                    ? statusMutation
                        .variables
                        ?.id
                    : null,
        });

    return (
        <>
            <div className="mb-4">
                <h1 className="h3 fw-bold txt-blue mb-1">
                    Users
                </h1>

                <p className="text-secondary mb-0">
                    Manage ServerOps accounts,
                    roles, and individual
                    permissions
                </p>
            </div>

            <DataTable
                tableId="users"
                columns={columns}
                rows={rows}
                rowKey="id"
                loading={
                    listQuery.isPending
                }
                refreshing={
                    listQuery.isFetching
                }
                error={
                    listQuery.isError
                        ? getApiError(
                            listQuery.error
                        ).message
                        : ''
                }
                emptyMessage="No users found."
                pagination={pagination}
                onPageChange={setPage}
                pageSize={pageSize}
                pageSizeOptions={[
                    5,
                    10,
                    25,
                    50,
                    100,
                ]}
                onPageSizeChange={
                    value => {
                        setPageSize(
                            value
                        );

                        setPage(1);
                    }
                }
                searchValue={search}
                onSearch={setSearch}
                onRefresh={() =>
                    listQuery.refetch()
                }
                {...(
                    hasPermission(
                        PERMISSIONS.USERS_CREATE
                    )
                        ? {
                            onCreate:
                                () => {
                                    createMutation
                                        .reset();

                                    setCreateOpen(
                                        true
                                    );
                                },
                        }
                        : {}
                )}
            />

            <CreateModal
                open={createOpen}
                submitting={
                    createMutation.isPending
                }
                error={
                    createMutation.isError
                        ? createMutation.error
                        : null
                }
                onClose={() => {
                    if (
                        !createMutation.isPending
                    ) {
                        createMutation.reset();

                        setCreateOpen(false);
                    }
                }}
                onSubmit={values =>
                    createMutation.mutate(
                        values
                    )
                }
            />

            <ViewModal
                open={Boolean(viewUser)}
                userId={viewUser?.id}
                onClose={() =>
                    setViewUser(null)
                }
            />

            <EditModal
                open={Boolean(editUser)}
                userId={editUser?.id}
                submitting={
                    updateMutation.isPending
                }
                error={
                    updateMutation.isError
                        ? updateMutation.error
                        : null
                }
                onClose={() => {
                    if (
                        !updateMutation.isPending
                    ) {
                        updateMutation.reset();

                        setEditUser(null);
                    }
                }}
                onSubmit={values =>
                    updateMutation.mutate({
                        id:
                            editUser.id,

                        values,
                    })
                }
            />

            <PermissionsModal
                open={
                    Boolean(
                        permissionsUser
                    )
                }
                userId={
                    permissionsUser?.id
                }
                submitting={
                    permissionsMutation
                        .isPending
                }
                error={
                    permissionsMutation
                        .isError
                        ? permissionsMutation
                            .error
                        : null
                }
                onClose={() => {
                    if (
                        !permissionsMutation
                            .isPending
                    ) {
                        permissionsMutation
                            .reset();

                        setPermissionsUser(
                            null
                        );
                    }
                }}
                onSubmit={
                    permissions =>
                        permissionsMutation
                            .mutate({
                                id:
                                    permissionsUser
                                        .id,

                                permissions,
                            })
                }
            />
        </>
    );
}