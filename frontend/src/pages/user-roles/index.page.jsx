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
    user_role_create,
    user_role_delete,
    user_role_list,
    user_role_set_status,
    user_role_update,
} from '../../api/user-roles';

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

import ViewModal from
    './view.modal';


function createColumns({
    hasPermission,
    onView,
    onEdit,
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
            label: 'Role Name',
            hideable: false,
            render: role => (
                <div>
                    <div className="fw-semibold">
                        {role.name}
                    </div>

                    <div className="small text-secondary font-monospace">
                        {role.slug}
                    </div>
                </div>
            ),
        },

        {
            key: 'permissions',
            label: 'Permissions',
            render: role => {
                const permissions =
                    Array.isArray(
                        role.permissions
                    )
                        ? role.permissions
                        : [];

                if (
                    permissions.includes(
                        PERMISSIONS.ALL
                    )
                ) {
                    return (
                        <span className="badge text-bg-danger">
                            Full access
                        </span>
                    );
                }

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
            render: role =>
                role.remarks || '—',
        },

        {
            key: 'tags',
            label: 'Tags',
            defaultVisible: false,
            render: role => {
                const tags =
                    Array.isArray(role.tags)
                        ? role.tags
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
            render: role =>
                role.created_at
                    ? formatToIST(
                        role.created_at
                    )
                    : '—',
        },

        {
            key: 'updated_at',
            label: 'Updated At',
            defaultVisible: false,
            render: role =>
                role.updated_at
                    ? formatToIST(
                        role.updated_at
                    )
                    : '—',
        },

        {
            key: 'status',
            label: 'Status',
            render: role => {
                if (
                    !hasPermission(
                        PERMISSIONS.USER_ROLES_STATUS
                    )
                ) {
                    return (
                        <span
                            className={
                                `badge ${
                                    role.status
                                        ? 'text-bg-success'
                                        : 'text-bg-danger'
                                }`
                            }
                        >
                            {role.status
                                ? 'Active'
                                : 'Inactive'}
                        </span>
                    );
                }

                return (
                    <div className="form-check form-switch mb-0">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            role="switch"
                            checked={
                                Boolean(
                                    role.status
                                )
                            }
                            disabled={
                                statusPendingId !==
                                null
                            }
                            aria-label={
                                role.status
                                    ? `Disable ${role.name}`
                                    : `Enable ${role.name}`
                            }
                            onChange={() =>
                                onStatusChange(
                                    role,
                                    !role.status
                                )
                            }
                        />

                        {statusPendingId ===
                            role.id && (
                            <span className="small ms-2">
                                Updating…
                            </span>
                        )}
                    </div>
                );
            },
        },

        {
            key: 'actions',
            label: 'Actions',
            hideable: false,
            render: role => (
                <div className="d-flex flex-wrap gap-1">
                    {hasPermission(
                        PERMISSIONS.USER_ROLES_READ
                    ) && (
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary btn-blue"
                            onClick={() =>
                                onView(role)
                            }
                        >
                            <i className="bi bi-eye me-1" />

                            View
                        </button>
                    )}

                    {hasPermission(
                        PERMISSIONS.USER_ROLES_UPDATE
                    ) && (
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary btn-blue"
                            onClick={() =>
                                onEdit(role)
                            }
                        >
                            <i className="bi bi-pencil me-1" />

                            Edit
                        </button>
                    )}

                    {hasPermission(
                        PERMISSIONS.USER_ROLES_DELETE
                    ) && (
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary btn-red"
                            disabled={
                                deletingId !== null
                            }
                            onClick={() =>
                                onDelete(role)
                            }
                        >
                            <i className="bi bi-trash me-1" />

                            {deletingId ===
                            role.id
                                ? 'Removing…'
                                : 'Remove'}
                        </button>
                    )}
                </div>
            ),
        },
    ];
}


export default function UserRolesPage() {
    const {
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
        viewRole,
        setViewRole,
    ] = useState(null);

    const [
        editRole,
        setEditRole,
    ] = useState(null);

    useEffect(() => {
        document.title =
            'User Roles | ServerOps';
    }, []);

    useEffect(() => {
        const timer = setTimeout(
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
            'user_roles',
            page,
            pageSize,
            debouncedSearch,
        ],

        queryFn: () =>
            user_role_list({
                page,
                page_size: pageSize,
                search:
                    debouncedSearch,
            }),

        retry: false,
        staleTime: 0,
    });

    const pagination =
        listQuery.data?.pagination;

    const rows = useMemo(() => {
        const records =
            listQuery.data?.data ?? [];

        const currentPage =
            pagination?.page ?? page;

        const currentPageSize =
            pagination?.page_size ??
            pageSize;

        const start =
            (
                currentPage - 1
            ) * currentPageSize;

        return records.map(
            (
                role,
                index
            ) => ({
                ...role,

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

    const invalidateList = () =>
        queryClient.invalidateQueries({
            queryKey: [
                'user_roles',
            ],
        });

    const createMutation =
        useMutation({
            mutationFn:
                user_role_create,

            onSuccess: async response => {
                setCreateOpen(false);

                await invalidateList();

                toast.success(
                    response?.message ??
                    'User role created successfully.'
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
                user_role_update(
                    id,
                    values
                ),

            onSuccess: async response => {
                const updatedRoleId =
                    editRole?.id;

                setEditRole(null);

                await invalidateList();

                if (updatedRoleId) {
                    await queryClient
                        .invalidateQueries({
                            queryKey: [
                                'user_role',
                                updatedRoleId,
                            ],
                        });
                }

                toast.success(
                    response?.message ??
                    'User role updated successfully.'
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
                user_role_delete,

            onSuccess: async response => {
                await invalidateList();

                toast.success(
                    response?.message ??
                    'User role removed successfully.'
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

    const statusMutation =
        useMutation({
            mutationFn: ({
                id,
                enabled,
            }) =>
                user_role_set_status(
                    id,
                    enabled
                ),

            onSuccess: async response => {
                await invalidateList();

                toast.success(
                    response?.message ??
                    'User role status updated.'
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

    const handleDelete =
        async role => {
            const {
                confirmed,
            } = await confirm({
                title:
                    'Remove user role?',

                message: (
                    <>
                        You are about to remove{' '}
                        <strong>
                            {role.name}
                        </strong>
                        .
                        <br />
                        Users assigned to this
                        role may be affected.
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
                                {role.name}
                            </strong>{' '}
                            to confirm:
                        </>
                    ),

                    validationLabel:
                        'Role name',

                    placeholder:
                        role.name,

                    required: true,

                    maxLength:
                        role.name.length,

                    validate:
                        value =>
                            value ===
                                role.name ||
                            'The role name does not match.',
                },
            });

            if (confirmed) {
                deleteMutation.mutate(
                    role.id
                );
            }
        };

    const handleStatusChange =
        async (
            role,
            enabled
        ) => {
            const actionLabel =
                enabled
                    ? 'enable'
                    : 'disable';

            const {
                confirmed,
            } = await confirm({
                title:
                    `${enabled
                        ? 'Enable'
                        : 'Disable'} user role?`,

                message: (
                    <>
                        Do you want to{' '}
                        <strong>
                            {actionLabel}
                        </strong>{' '}
                        the{' '}
                        <strong>
                            {role.name}
                        </strong>{' '}
                        role?
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
                    id: role.id,
                    enabled,
                });
            }
        };

    const columns =
        createColumns({
            hasPermission,

            onView:
                setViewRole,

            onEdit:
                role => {
                    updateMutation.reset();

                    setEditRole(role);
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
                    User Roles
                </h1>

                <p className="text-secondary mb-0">
                    Manage application roles and
                    their permissions
                </p>
            </div>

            <DataTable
                tableId="user-roles"
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
                emptyMessage="No user roles found."
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
                        PERMISSIONS.USER_ROLES_CREATE
                    )
                        ? {
                            onCreate:
                                () => {
                                    createMutation.reset();

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
                open={Boolean(viewRole)}
                userRoleId={
                    viewRole?.id
                }
                onClose={() =>
                    setViewRole(null)
                }
            />

            <EditModal
                open={Boolean(editRole)}
                userRoleId={
                    editRole?.id
                }
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

                        setEditRole(null);
                    }
                }}
                onSubmit={values =>
                    updateMutation.mutate({
                        id:
                            editRole.id,

                        values,
                    })
                }
            />
        </>
    );
}