import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import DataTable from "../../components/data-table";
import { formatToIST } from "../../components/helpers";
import { getApiError } from "../../api/api-error";
import { inventory_read } from "../../api/inventories";
import {
  managed_command_create,
  managed_command_delete,
  managed_command_execute,
  managed_command_list,
  managed_command_set_status,
  managed_command_update,
} from "../../api/managed-commands";
import { PERMISSIONS } from "../../config/permissions";
import { useAuth } from "../../hooks/useAuth";
import useConfirmation from "../../hooks/useConfirmation";
import CreateModal from "./create.modal";
import EditModal from "./edit.modal";
import ExecutionResultModal from "./execution-result.modal";
import ViewModal from "./view.modal";

const createColumns = ({
  hasPermission,
  onView,
  onEdit,
  onDelete,
  onExecute,
  onStatusChange,
  deletingId,
  executingId,
  statusPendingId,
}) => [
  { key: "serial_number", label: "Sl. No.", hideable: false },
  { key: "name", label: "Name", hideable: false },
  {
    key: "command",
    label: "Command",
    hideable: false,
    render: record => (
      <span className="font-monospace text-break" title={record.command}>
        {record.command}
      </span>
    ),
  },
  {
    key: "timeout_seconds",
    label: "Timeout",
    render: record => `${record.timeout_seconds} seconds`,
  },
  { key: "description", label: "Description", defaultVisible: false },
  { key: "remarks", label: "Remarks", defaultVisible: false },
  {
    key: "tags",
    label: "Tags",
    defaultVisible: false,
    render: record => {
      const tags = Array.isArray(record.tags) ? record.tags : [];
      return tags.length
        ? tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className="badge rounded-pill bg-blue me-1">
              {tag}
            </span>
          ))
        : "—";
    },
  },
  {
    key: "creator",
    label: "Creator",
    defaultVisible: false,
    render: record => record.creator ? `@${record.creator.userid}` : "—",
  },
  {
    key: "created_at",
    label: "Created At",
    defaultVisible: false,
    render: record => formatToIST(record.created_at),
  },
  {
    key: "updated_at",
    label: "Updated At",
    defaultVisible: false,
    render: record => formatToIST(record.updated_at),
  },
  {
    key: "status",
    label: "Status",
    render: record => {
      if (!hasPermission(PERMISSIONS.MANAGED_COMMANDS_STATUS)) {
        return (
          <span className={`badge ${record.status ? "text-bg-success" : "text-bg-danger"}`}>
            {record.status ? "Active" : "Inactive"}
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
            aria-label={record.status ? `Disable ${record.name}` : `Enable ${record.name}`}
            onChange={() => onStatusChange(record, !record.status)}
          />
          {statusPendingId === record.id && <span className="small ms-2">Updating…</span>}
        </div>
      );
    },
  },
  {
    key: "actions",
    label: "Actions",
    hideable: false,
    render: record => (
      <div className="d-flex flex-wrap gap-1">
        {hasPermission(PERMISSIONS.MANAGED_COMMANDS_READ) && (
          <button type="button" className="btn btn-sm btn-secondary btn-blue" onClick={() => onView(record)}>
            <i className="bi bi-eye me-1" />View
          </button>
        )}
        {hasPermission(PERMISSIONS.MANAGED_COMMANDS_EXECUTE) && (
          <button
            type="button"
            className="btn btn-sm btn-outline-success"
            disabled={!record.status || executingId !== null}
            onClick={() => onExecute(record)}
          >
            <i className="bi bi-play-fill me-1" />
            {executingId === record.id ? "Executing…" : "Execute"}
          </button>
        )}
        {hasPermission(PERMISSIONS.MANAGED_COMMANDS_UPDATE) && (
          <button type="button" className="btn btn-sm btn-secondary btn-blue" onClick={() => onEdit(record)}>
            <i className="bi bi-pencil me-1" />Edit
          </button>
        )}
        {hasPermission(PERMISSIONS.MANAGED_COMMANDS_DELETE) && (
          <button
            type="button"
            className="btn btn-sm btn-secondary btn-red"
            disabled={deletingId !== null}
            onClick={() => onDelete(record)}
          >
            <i className="bi bi-trash me-1" />
            {deletingId === record.id ? "Removing…" : "Remove"}
          </button>
        )}
      </div>
    ),
  },
];

export default function ManagedCommandsPage() {
  const { id } = useParams();
  const { hasPermission } = useAuth();
  const { confirm } = useConfirmation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);

  useEffect(() => {
    document.title = "Managed Commands | ServerOps";
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const inventoryQuery = useQuery({
    queryKey: ["inventory", id],
    queryFn: () => inventory_read(id),
    enabled: Boolean(id),
    retry: false,
  });

  const listQuery = useQuery({
    queryKey: ["managed_commands", id, page, pageSize, debouncedSearch],
    queryFn: () => managed_command_list({ inventoryId: id, page, page_size: pageSize, search: debouncedSearch }),
    enabled: Boolean(id),
    retry: false,
    staleTime: 0,
  });

  const pagination = listQuery.data?.pagination;
  const rows = useMemo(() => {
    const records = listQuery.data?.data ?? [];
    const currentPage = pagination?.page ?? page;
    const currentPageSize = pagination?.page_size ?? pageSize;
    const start = (currentPage - 1) * currentPageSize;
    return records.map((record, index) => ({ ...record, serial_number: start + index + 1 }));
  }, [listQuery.data?.data, pagination?.page, pagination?.page_size, page, pageSize]);

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: ["managed_commands", id] });

  const createMutation = useMutation({
    mutationFn: values => managed_command_create(id, values),
    onSuccess: async response => {
      setCreateOpen(false);
      await invalidateList();
      toast.success(response?.message ?? "Managed command created successfully.");
    },
    onError: error => toast.error(getApiError(error).message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ managedCommandId, values }) => managed_command_update(id, managedCommandId, values),
    onSuccess: async response => {
      const updatedId = editRecord?.id;
      setEditRecord(null);
      await invalidateList();
      if (updatedId) await queryClient.invalidateQueries({ queryKey: ["managed_command", id, updatedId] });
      toast.success(response?.message ?? "Managed command updated successfully.");
    },
    onError: error => toast.error(getApiError(error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: managedCommandId => managed_command_delete(id, managedCommandId),
    onSuccess: async response => {
      await invalidateList();
      toast.success(response?.message ?? "Managed command removed successfully.");
    },
    onError: error => toast.error(getApiError(error).message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ managedCommandId, enabled }) => managed_command_set_status(id, managedCommandId, enabled),
    onSuccess: async response => {
      await invalidateList();
      toast.success(response?.message ?? "Managed command status updated.");
    },
    onError: error => toast.error(getApiError(error).message),
  });

  const executeMutation = useMutation({
    mutationFn: ({ managedCommandId, reason }) => managed_command_execute(id, managedCommandId, reason),
    onSuccess: async response => {
      setExecutionResult(response);
      await queryClient.invalidateQueries({ queryKey: ["command_executions"] });
      if (response?.execution_success) toast.success(response.message ?? "Command completed successfully.");
      else toast.warning(response?.message ?? "Command execution completed with a failure.");
    },
    onError: error => toast.error(getApiError(error).message),
  });

  const handleDelete = async record => {
    const { confirmed } = await confirm({
      title: "Remove managed command?",
      message: <>Remove <strong>{record.name}</strong>? This removes the ServerOps command definition; it does not run the command.</>,
      confirmLabel: "Remove",
      variant: "danger",
      input: {
        label: <>Type <strong>{record.name}</strong> to confirm:</>,
        validationLabel: "Command name",
        placeholder: record.name,
        required: true,
        maxLength: record.name.length,
        validate: value => value === record.name || "The command name does not match.",
      },
    });
    if (confirmed) deleteMutation.mutate(record.id);
  };

  const handleExecute = async record => {
    const { confirmed, inputValue: reason } = await confirm({
      title: "Execute managed command?",
      message: <><strong>{record.name}</strong><div className="border rounded bg-light p-2 mt-2 font-monospace text-break">{record.command}</div></>,
      confirmLabel: "Execute",
      variant: "warning",
      input: {
        label: "Reason",
        placeholder: "Why is this command being executed?",
        required: true,
        minLength: 3,
        maxLength: 500,
        requiredMessage: "An execution reason is required.",
      },
    });
    if (confirmed) executeMutation.mutate({ managedCommandId: record.id, reason });
  };

  const columns = createColumns({
    hasPermission,
    onView: setViewRecord,
    onEdit: record => { updateMutation.reset(); setEditRecord(record); },
    onDelete: handleDelete,
    onExecute: handleExecute,
    onStatusChange: (record, enabled) => statusMutation.mutate({ managedCommandId: record.id, enabled }),
    deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
    executingId: executeMutation.isPending ? executeMutation.variables?.managedCommandId : null,
    statusPendingId: statusMutation.isPending ? statusMutation.variables?.managedCommandId : null,
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div><h1 className="h3 fw-bold txt-blue mb-1">Managed Commands</h1><p className="text-secondary mb-0">Approved commands for this inventory</p></div>
        <Link to="/inventories" className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-2" />Inventories</Link>
      </div>

      <div className="card mb-3"><div className="card-body">
        {inventoryQuery.isPending && <span>Loading inventory…</span>}
        {inventoryQuery.isError && <div className="alert alert-danger mb-0">{getApiError(inventoryQuery.error).message}</div>}
        {inventoryQuery.data && <><strong>{inventoryQuery.data.name}</strong><span className="text-secondary ms-3 font-monospace">{inventoryQuery.data.hostname}:{inventoryQuery.data.ssh_port}</span></>}
      </div></div>

      <DataTable
        tableId={`inventory-${id}-managed-commands`}
        columns={columns}
        rows={rows}
        rowKey="id"
        loading={listQuery.isPending}
        refreshing={listQuery.isFetching}
        error={listQuery.isError ? getApiError(listQuery.error).message : ""}
        emptyMessage="No managed commands configured."
        pagination={pagination}
        onPageChange={setPage}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        onPageSizeChange={value => { setPageSize(value); setPage(1); }}
        searchValue={search}
        onSearch={setSearch}
        onRefresh={() => listQuery.refetch()}
        {...(hasPermission(PERMISSIONS.MANAGED_COMMANDS_CREATE) && { onCreate: () => { createMutation.reset(); setCreateOpen(true); } })}
      />

      <CreateModal open={createOpen} submitting={createMutation.isPending} error={createMutation.isError ? createMutation.error : null} onClose={() => { if (!createMutation.isPending) { createMutation.reset(); setCreateOpen(false); } }} onSubmit={values => createMutation.mutate(values)} />
      <ViewModal open={Boolean(viewRecord)} inventoryId={id} managedCommandId={viewRecord?.id} onClose={() => setViewRecord(null)} />
      <EditModal open={Boolean(editRecord)} inventoryId={id} managedCommandId={editRecord?.id} submitting={updateMutation.isPending} error={updateMutation.isError ? updateMutation.error : null} onClose={() => { if (!updateMutation.isPending) { updateMutation.reset(); setEditRecord(null); } }} onSubmit={values => updateMutation.mutate({ managedCommandId: editRecord.id, values })} />
      <ExecutionResultModal open={Boolean(executionResult)} response={executionResult} onClose={() => setExecutionResult(null)} />
    </>
  );
}
