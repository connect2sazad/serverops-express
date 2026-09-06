import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import useConfirmation from "../../hooks/useConfirmation";
import { useAuth } from "../../hooks/useAuth";
import DataTable from "../../components/data-table";
import { process_list, process_action } from "../../api/processes";
import { getApiError } from "../../api/api-error";

import ViewModal from './view.modal';
import { PERMISSIONS } from "../../config/permissions";
import { inventory_read } from "../../api/inventories";

const createColumns = ({
  hasPermission,
  onView,
  onAction,
  runningAction,
}) => [
    {
      key: "serial_number",
      label: "Sl. No.",
      hideable: false,
    },
    {
      key: "pid",
      label: "PID",
      hideable: false,
    },
    {
      key: "user",
      label: "User",
    },
    {
      key: "cpu_percent",
      label: "CPU",
      render: process =>
        `${process.cpu_percent}%`,
    },
    {
      key: "memory_percent",
      label: "Memory",
      render: process =>
        `${process.memory_percent}%`,
    },
    {
      key: "resident_memory",
      label: "RSS",
      defaultVisible: false,
      render: process =>
        `${(process.resident_memory / 1024).toFixed(2)} MiB`,
    },
    {
      key: "virtual_memory",
      label: "VSZ",
      defaultVisible: false,
      render: process =>
        `${(process.virtual_memory / 1024).toFixed(2)} MiB`,
    },
    {
      key: "state",
      label: "State",
    },
    {
      key: "tty",
      label: "TTY",
      defaultVisible: false,
    },
    {
      key: "started_at",
      label: "Started",
      defaultVisible: false,
    },
    {
      key: "cpu_time",
      label: "CPU Time",
    },
    {
      key: "command",
      label: "Command",
      render: process => (
        <span
          className="font-monospace text-break"
          title={process.command}
        >
          {process.command}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      hideable: false,
      render: process => {
        const terminateKey =
          `${process.pid}:terminate`;

        const killKey =
          `${process.pid}:force_kill`;

        const busy = runningAction !== null;

        return (
          <div className="d-flex flex-wrap gap-1">
            {hasPermission(
              PERMISSIONS.PROCESSES_READ
            ) && (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary btn-blue"
                  disabled={busy}
                  onClick={() => onView(process)}
                >
                  <i className="bi bi-eye me-1" />
                  View
                </button>
              )}

            {hasPermission(
              PERMISSIONS.PROCESSES_TERMINATE
            ) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  disabled={busy || process.pid <= 1}
                  onClick={() =>
                    onAction(process, "terminate")
                  }
                >
                  <i className="bi bi-x-circle me-1" />
                  {runningAction === terminateKey
                    ? "Terminating…"
                    : "Terminate"}
                </button>
              )}

            {hasPermission(
              PERMISSIONS.PROCESSES_KILL
            ) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  disabled={busy || process.pid <= 1}
                  onClick={() =>
                    onAction(process, "force_kill")
                  }
                >
                  <i className="bi bi-exclamation-octagon me-1" />
                  {runningAction === killKey
                    ? "Killing…"
                    : "Force Kill"}
                </button>
              )}
          </div>
        );
      },
    },
  ];

export default function ProcessesPage() {
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const [selectedProcess, setSelectedProcess] = useState(null);
  const queryClient = useQueryClient();
  const { confirm } = useConfirmation();
  const [runningAction, setRunningAction] = useState(null);

  useEffect(() => {
    document.title = "Processes | ServerOps";
  }, []);

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["inventory_processes", id],
    queryFn: () => process_list(id),
    enabled: Boolean(id),
    retry: false,
    staleTime: 0,
  });

  const {
    data: inventory,
    isPending: inventoryPending,
    isError: inventoryIsError,
    error: inventoryError
  } = useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventory_read(id),
    enabled: Boolean(id),
    retry: false,
  });

  const processes = data?.data?.processes ?? [];
  const metadata = data?.data?.metadata;

  const filteredProcesses = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return processes;
    }

    return processes.filter(process =>
      [
        process.pid,
        process.user,
        process.cpu_percent,
        process.memory_percent,
        process.state,
        process.tty,
        process.started_at,
        process.cpu_time,
        process.command,
      ].some(value =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch)
      )
    );
  }, [processes, search]);

  const total = filteredProcesses.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedProcesses = useMemo(() => {
    const startIndex = (page - 1) * pageSize;

    return filteredProcesses
      .slice(startIndex, startIndex + pageSize)
      .map((process, index) => ({
        ...process,
        serial_number: startIndex + index + 1,
      }));
  }, [
    filteredProcesses,
    page,
    pageSize,
  ]);

  const pagination = {
    page,
    page_size: pageSize,
    total,
    total_pages: totalPages,
    has_next_page: page < totalPages,
    has_previous_page: page > 1,
  };

  // mutations======================================================================================
  const actionMutation = useMutation({
    mutationFn: ({ pid, action, reason }) =>
      process_action(
        id,
        pid,
        action,
        reason
      ),

    onSuccess: async response => {
      toast.success(
        response?.message ??
        "Process action completed successfully."
      );

      await queryClient.invalidateQueries({
        queryKey: ["inventory_processes", id],
      });
    },

    onError: error => {
      toast.error(getApiError(error).message);
    },

    onSettled: () => {
      setRunningAction(null);
    },
  });
  // handles========================================================================================
  const handleSearch = value => {
    setSearch(value);
    setPage(1);
  };

  const handlePageSizeChange = value => {
    setPageSize(value);
    setPage(1);
  };

  const handleProcessAction = async (
    process,
    action
  ) => {
    if (actionMutation.isPending) return;

    const force = action === "force_kill";

    const actionLabel = force
      ? "Force Kill"
      : "Terminate";

    const { confirmed, inputValue: reason } =
      await confirm({
        title: `${actionLabel} process?`,
        message: (
          <>
            You are about to{" "}
            <strong>{actionLabel.toLowerCase()}</strong>{" "}
            process PID{" "}
            <strong>{process.pid}</strong>.
            <br />
            Command:{" "}
            <span className="font-monospace">
              {process.command}
            </span>
          </>
        ),
        confirmLabel: actionLabel,
        variant: force ? "danger" : "warning",
        input: {
          label: "Reason",
          placeholder:
            "Why is this process being terminated?",
          required: true,
          minLength: 3,
          maxLength: 500,
          type: "text",
          requiredMessage: "A reason is required.",
        },
      });

    if (!confirmed) return;

    setRunningAction(
      `${process.pid}:${action}`
    );

    actionMutation.mutate({
      pid: process.pid,
      action,
      reason,
    });
  };

  const columns = createColumns({
    hasPermission,
    onView: process => setSelectedProcess(process),
    onAction: handleProcessAction,
    runningAction,
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="h3 fw-bold txt-blue mb-1">
            Processes
          </h1>

          <p className="text-secondary mb-0">
            Processes running on this inventory
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
          <h2 className="h5 mb-3">
            Inventory Details
          </h2>

          {inventoryPending && (
            <p className="mb-0">
              Loading inventory…
            </p>
          )}

          {inventoryIsError && (
            <div className="alert alert-danger mb-0">
              {getApiError(inventoryError).message}
            </div>
          )}

          {!inventoryPending &&
            !inventoryIsError &&
            inventory && (
              <div className="row g-3">
                <div className="col-md-3">
                  <small className="text-secondary d-block">
                    Name
                  </small>
                  <strong>{inventory.name}</strong>
                </div>

                <div className="col-md-3">
                  <small className="text-secondary d-block">
                    SSH Host
                  </small>
                  <span className="font-monospace">
                    {inventory.hostname}:
                    {inventory.ssh_port}
                  </span>
                </div>

                <div className="col-md-2">
                  <small className="text-secondary d-block">
                    Environment
                  </small>
                  <span>
                    {inventory.environment ?? "—"}
                  </span>
                </div>

                <div className="col-md-2">
                  <small className="text-secondary d-block">
                    Operating System
                  </small>
                  <span>
                    {inventory.operating_system ?? "—"}
                  </span>
                </div>

                <div className="col-md-2">
                  <small className="text-secondary d-block">
                    Status
                  </small>
                  <span
                    className={`badge ${inventory.status
                      ? "text-bg-success"
                      : "text-bg-danger"
                      }`}
                  >
                    {inventory.status
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
            )}
        </div>
      </div>

      {metadata?.duration != null && (
        <div className="alert alert-light border py-2">
          Retrieved in {metadata.duration} ms
        </div>
      )}

      <DataTable
        tableId={`inventory-${id}-processes`}
        columns={columns}
        rows={paginatedProcesses}
        rowKey="pid"
        loading={isPending}
        refreshing={isFetching}
        error={
          isError
            ? getApiError(error).message
            : ""
        }
        emptyMessage={
          search
            ? "No processes match your search."
            : "No processes found."
        }
        searchValue={search}
        onSearch={handleSearch}
        pagination={pagination}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        onPageSizeChange={handlePageSizeChange}
        onPageChange={setPage}
        onRefresh={() => refetch()}
      />

      <ViewModal
        open={Boolean(selectedProcess)}
        inventoryId={id}
        pid={selectedProcess?.pid}
        onClose={() => setSelectedProcess(null)}
      />
    </>
  );
}