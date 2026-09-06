import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DataTable from "../../components/data-table";
import { getApiError } from "../../api/api-error";
import { inventory_read } from "../../api/inventories";
import {
    managed_service_list, managed_service_create, managed_service_update, managed_service_delete, managed_service_set_status
} from "../../api/managed-services";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../config/permissions";
import CreateModal from "./create.modal";
import ViewModal from "./view.modal";
import EditModal from "./edit.modal";
import useConfirmation from "../../hooks/useConfirmation";

function PermissionBadge({ allowed }) {
    return (
        <span
            className={`badge ${allowed
                ? "bg-blue"
                : "bg-red"
                }`}
        >
            {allowed ? "Allowed" : "Denied"}
        </span>
    );
}

const createColumns = ({
    hasPermission,
    onView,
    onEdit,
    onDelete,
    deletingId,
    onStatusChange,
    statusPendingId,
}) => [
        {
            key: "serial_number",
            label: "Sl. No.",
            hideable: false,
        },
        {
            key: "service_name",
            label: "Service",
            hideable: false,
        },
        {
            key: "can_start",
            label: "Start",
            render: record => (
                <PermissionBadge
                    allowed={record.can_start}
                />
            ),
        },
        {
            key: "can_stop",
            label: "Stop",
            render: record => (
                <PermissionBadge
                    allowed={record.can_stop}
                />
            ),
        },
        {
            key: "can_restart",
            label: "Restart",
            render: record => (
                <PermissionBadge
                    allowed={record.can_restart}
                />
            ),
        },
        {
            key: "can_enable",
            label: "Enable",
            render: record => (
                <PermissionBadge
                    allowed={record.can_enable}
                />
            ),
        },
        {
            key: "can_disable",
            label: "Disable",
            render: record => (
                <PermissionBadge
                    allowed={record.can_disable}
                />
            ),
        },
        {
            key: "status",
            label: "Status",
            render: record => {
                const pending =
                    statusPendingId === record.id;

                if (
                    !hasPermission(
                        PERMISSIONS.MANAGED_SERVICES_STATUS
                    )
                ) {
                    return (
                        <span
                            className={`badge ${record.status
                                ? "text-bg-success"
                                : "text-bg-danger"
                                }`}
                        >
                            {record.status
                                ? "Active"
                                : "Inactive"}
                        </span>
                    );
                }

                return (
                    <div className="form-check form-switch mb-0">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            role="switch"
                            checked={Boolean(record.status)}
                            disabled={statusPendingId !== null}
                            aria-label={
                                record.status
                                    ? `Disable ${record.service_name}`
                                    : `Enable ${record.service_name}`
                            }
                            onChange={() =>
                                onStatusChange({
                                    managedServiceId: record.id,
                                    enabled: !record.status,
                                })
                            }
                        />

                        {pending && (
                            <span className="small ms-2">
                                Updating…
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: "remarks",
            label: "Remarks",
            defaultVisible: false,
        },
        {
            key: "tags",
            label: "Tags",
            defaultVisible: false,
            render: record => {
                const tags = Array.isArray(record.tags)
                    ? record.tags
                    : [];

                return tags.length > 0
                    ? tags.map((tag, index) => (
                        <span
                            key={`${tag}-${index}`}
                            className="badge rounded-pill bg-blue me-1"
                        >
                            {tag}
                        </span>
                    ))
                    : "—";
            },
        },
        {
            key: "actions",
            label: "Actions",
            hideable: false,
            render: record => (
                <>
                    {hasPermission(
                        PERMISSIONS.MANAGED_SERVICES_READ
                    ) && (
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary btn-blue"
                                onClick={() => onView(record)}
                            >
                                <i className="bi bi-eye me-1" />
                                View
                            </button>
                        )}
                    {hasPermission(
                        PERMISSIONS.MANAGED_SERVICES_UPDATE
                    ) && (
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary btn-blue ms-1"
                                onClick={() => onEdit(record)}
                            >
                                <i className="bi bi-pencil me-1" />
                                Edit
                            </button>
                        )}

                    {hasPermission(
                        PERMISSIONS.MANAGED_SERVICES_DELETE
                    ) && (
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary btn-red ms-1"
                                disabled={deletingId !== null}
                                onClick={() => onDelete(record)}
                            >
                                <i className="bi bi-trash me-1" />

                                {deletingId === record.id
                                    ? "Removing…"
                                    : "Remove"}
                            </button>
                        )}
                </>
            ),
        },
    ];

export default function ManagedServicesPage() {
    const { id } = useParams();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { hasPermission } = useAuth();
    const queryClient = useQueryClient();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedManagedService, setSelectedManagedService] = useState(null);
    const [editingManagedService, setEditingManagedService] = useState(null);
    const { confirm } = useConfirmation();

    useEffect(() => {
        document.title =
            "Managed Services | ServerOps";
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const {
        data: inventory,
        isPending: inventoryPending,
        isError: inventoryIsError,
        error: inventoryError,
    } = useQuery({
        queryKey: ["inventory", id],
        queryFn: () => inventory_read(id),
        enabled: Boolean(id),
        retry: false,
    });

    const {
        data,
        isPending,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            "managed_services",
            id,
            page,
            pageSize,
            debouncedSearch,
        ],

        queryFn: () =>
            managed_service_list({
                inventoryId: id,
                page,
                page_size: pageSize,
                search: debouncedSearch,
            }),

        enabled: Boolean(id),
        retry: false,
        staleTime: 0,
    });

    const pagination = data?.pagination;

    const managedServices = useMemo(() => {
        const records = data?.data ?? [];

        const currentPage =
            pagination?.page ?? page;

        const currentPageSize =
            pagination?.page_size ?? pageSize;

        const startIndex =
            (currentPage - 1) * currentPageSize;

        return records.map((record, index) => ({
            ...record,
            serial_number: startIndex + index + 1,
        }));
    }, [
        data?.data,
        pagination?.page,
        pagination?.page_size,
        page,
        pageSize,
    ]);

    // mutation===============================================================================
    const createMutation = useMutation({
        mutationFn: values =>
            managed_service_create(id, values),

        onSuccess: async response => {
            setCreateModalOpen(false);

            await queryClient.invalidateQueries({
                queryKey: ["managed_services", id],
            });

            toast.success(
                response?.message ??
                "Managed service created successfully."
            );
        },

        onError: error => {
            toast.error(getApiError(error).message);
        },
    });
    const updateMutation = useMutation({
        mutationFn: ({
            managedServiceId,
            values,
        }) =>
            managed_service_update(
                id,
                managedServiceId,
                values
            ),

        onSuccess: async response => {
            const updatedId =
                editingManagedService?.id;

            setEditingManagedService(null);

            await queryClient.invalidateQueries({
                queryKey: ["managed_services", id],
            });

            if (updatedId) {
                await queryClient.invalidateQueries({
                    queryKey: [
                        "managed_service",
                        id,
                        updatedId,
                    ],
                });
            }

            toast.success(
                response?.message ??
                "Managed service updated successfully."
            );
        },

        onError: error => {
            toast.error(getApiError(error).message);
        },
    });
    const deleteMutation = useMutation({
        mutationFn: managedServiceId =>
            managed_service_delete(
                id,
                managedServiceId
            ),

        onSuccess: async response => {
            await queryClient.invalidateQueries({
                queryKey: ["managed_services", id],
            });

            toast.success(
                response?.message ??
                "Managed service removed successfully."
            );
        },

        onError: error => {
            toast.error(getApiError(error).message);
        },
    });
    const statusMutation = useMutation({
        mutationFn: ({
            managedServiceId,
            enabled,
        }) =>
            managed_service_set_status(
                id,
                managedServiceId,
                enabled
            ),

        onSuccess: async (
            response,
            variables
        ) => {
            await queryClient.invalidateQueries({
                queryKey: ["managed_services", id],
            });

            toast.success(
                response?.message ??
                (variables.enabled
                    ? "Managed service enabled successfully."
                    : "Managed service disabled successfully.")
            );
        },

        onError: error => {
            toast.error(getApiError(error).message);
        },
    });

    const handlePageSizeChange = value => {
        setPageSize(value);
        setPage(1);
    };

    const handleDelete = async record => {
        if (deleteMutation.isPending) return;

        const { confirmed, inputValue } =
            await confirm({
                title: "Remove managed service?",
                message: (
                    <>
                        You are about to remove the policy for{" "}
                        <strong>{record.service_name}</strong>.
                        <br />
                        <br />
                        Its service actions will no longer be allowed
                        through ServerOps.
                    </>
                ),
                confirmLabel: "Remove",
                variant: "danger",
                input: {
                    label: (
                        <>
                            Type{" "}
                            <strong>
                                {record.service_name}
                            </strong>{" "}
                            to confirm:
                        </>
                    ),
                    type: 'text',
                    validationLabel: "Service name",
                    placeholder: record.service_name,
                    required: true,
                    maxLength: record.service_name.length,
                    requiredMessage:
                        "The service name is required.",
                    validate: value =>
                        value === record.service_name ||
                        "The service name does not match.",
                },
            });

        if (!confirmed) return;

        deleteMutation.mutate(record.id);
    };

    const columns = createColumns({
        hasPermission,

        onView: record =>
            setSelectedManagedService(record),

        onEdit: record => {
            updateMutation.reset();
            setEditingManagedService(record);
        },

        onDelete: handleDelete,

        deletingId: deleteMutation.isPending
            ? deleteMutation.variables
            : null,

        onStatusChange: values =>
            statusMutation.mutate(values),

        statusPendingId:
            statusMutation.isPending
                ? statusMutation.variables
                    ?.managedServiceId
                : null,
    });

    return (
        <>
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h1 className="h3 fw-bold txt-blue mb-1">
                        Managed Services
                    </h1>

                    <p className="text-secondary mb-0">
                        Allowed service actions for this inventory
                    </p>
                </div>

                <Link
                    to="/inventories"
                    className="btn btn-outline-secondary"
                >
                    <i className="bi bi-arrow-left me-2" />
                    Inventories
                </Link>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    {inventoryPending && (
                        <span>Loading inventory…</span>
                    )}

                    {inventoryIsError && (
                        <div className="alert alert-danger mb-0">
                            {getApiError(inventoryError).message}
                        </div>
                    )}

                    {inventory && (
                        <>
                            <strong>{inventory.name}</strong>

                            <span className="text-secondary ms-3 font-monospace">
                                {inventory.hostname}:{inventory.ssh_port}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <DataTable
                tableId={`inventory-${id}-managed-services`}
                columns={columns}
                rows={managedServices}
                rowKey="id"
                loading={isPending}
                refreshing={isFetching}
                error={
                    isError
                        ? getApiError(error).message
                        : ""
                }
                emptyMessage="No managed services configured."
                pagination={pagination}
                onPageChange={setPage}
                pageSize={pageSize}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                onPageSizeChange={handlePageSizeChange}
                searchValue={search}
                onSearch={setSearch}
                onRefresh={() => refetch()}
                {...(hasPermission(
                    PERMISSIONS.MANAGED_SERVICES_CREATE
                ) && {
                    onCreate: () => {
                        createMutation.reset();
                        setCreateModalOpen(true);
                    },
                })}
            />


            <CreateModal
                open={createModalOpen}
                inventoryId={id}
                submitting={createMutation.isPending}
                error={
                    createMutation.isError
                        ? createMutation.error
                        : null
                }
                onClose={() => {
                    if (createMutation.isPending) return;

                    createMutation.reset();
                    setCreateModalOpen(false);
                }}
                onSubmit={values =>
                    createMutation.mutate(values)
                }
            />

            <ViewModal
                open={Boolean(selectedManagedService)}
                inventoryId={id}
                managedServiceId={
                    selectedManagedService?.id
                }
                onClose={() =>
                    setSelectedManagedService(null)
                }
            />

            <EditModal
                open={Boolean(editingManagedService)}
                inventoryId={id}
                managedServiceId={
                    editingManagedService?.id
                }
                submitting={updateMutation.isPending}
                error={
                    updateMutation.isError
                        ? updateMutation.error
                        : null
                }
                onClose={() => {
                    if (updateMutation.isPending) return;

                    updateMutation.reset();
                    setEditingManagedService(null);
                }}
                onSubmit={values =>
                    updateMutation.mutate({
                        managedServiceId:
                            editingManagedService.id,
                        values,
                    })
                }
            />
        </>
    );
}