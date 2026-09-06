import { useEffect, useState, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';

import { PERMISSIONS } from '../../config/permissions';
import { useAuth } from "../../hooks/useAuth";
import DataTable from "../../components/data-table";

// apis
import { command_execution_list } from '../../api/command_executions';
import ViewModal from "./view.modal";
import { formatToIST } from "../../components/helpers";

// define columns for this list page
const createColumns = ({
  hasPermission,
  onView,
}) => [
  {
    key: "serial_number",
    label: "Sl. No.",
    hideable: false,
  },
  {
    key: "command",
    label: "Command",
    hideable: false,
    render: execution => (
      <span
        className="font-monospace text-break"
        title={execution.command}
      >
        {execution.command}
      </span>
    ),
  },
  {
    key: "inventory",
    label: "Inventory",
    hideable: false,
    render: execution => {
      const inventory = execution.inventory;

      if (!inventory) return "—";

      return (
        <>
          <strong>{inventory.name}</strong>

          <small className="d-block text-secondary">
            {inventory.hostname}:{inventory.ssh_port}
          </small>
        </>
      );
    },
  },
  {
    key: "credential",
    label: "Credential",
    render: execution => {
      const credential = execution.credential;

      if (!credential) return "—";

      return (
        <>
          <span>{credential.username}</span>

          <small className="d-block text-secondary text-capitalize">
            {credential.type?.replace("-", " ")}
          </small>
        </>
      );
    },
  },
  {
    key: "command_status",
    label: "Status",
    hideable: false,
    render: execution => {
      const status = execution.command_status;

      const color = {
        success: "text-bg-success",
        failed: "text-bg-danger",
        timeout: "text-bg-warning",
        running: "text-bg-primary",
      }[status] ?? "text-bg-secondary";

      return (
        <span className={`badge ${color}`}>
          {status ?? "unknown"}
        </span>
      );
    },
  },
  {
    key: "exit_code",
    label: "Exit Code",
    render: execution =>
      execution.exit_code ?? "—",
  },
  {
    key: "duration",
    label: "Duration",
    render: execution =>
      execution.duration != null
        ? `${execution.duration} ms`
        : "—",
  },
  {
    key: "managed_command",
    label: "Source",
    render: execution =>
      execution.managed_command ? (
        <>
          <span className="badge text-bg-primary">
            Managed command
          </span>

          <small className="d-block mt-1">
            {execution.managed_command.name}
          </small>
        </>
      ) : (
        <span className="badge text-bg-secondary">
          System action
        </span>
      ),
  },
  {
    key: "started_at",
    label: "Started At",
    render: execution =>
      formatToIST(execution.started_at),
  },
  {
    key: "finished_at",
    label: "Finished At",
    defaultVisible: false,
    render: execution =>
      formatToIST(execution.finished_at),
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
    render: execution => {
      const tags = Array.isArray(execution.tags)
        ? execution.tags
        : [];

      if (tags.length === 0) return "—";

      return tags.map((tag, index) => (
        <span
          className="badge rounded-pill bg-blue m-1"
          key={`${tag}-${index}`}
        >
          {tag}
        </span>
      ));
    },
  },
  {
    key: "creator",
    label: "Executed By",
    defaultVisible: false,
    render: execution =>
      execution.creator
        ? (
            <>
              <span>{execution.creator.name}</span>
              <small className="d-block text-secondary">
                @{execution.creator.userid}
              </small>
            </>
          )
        : "—",
  },
  {
    key: "created_at",
    label: "Audit Created",
    defaultVisible: false,
    render: execution =>
      formatToIST(execution.created_at),
  },
  {
    key: "actions",
    label: "Actions",
    hideable: false,
    render: execution => (
      <>
        {hasPermission(
          PERMISSIONS.COMMAND_EXECUTIONS_READ
        ) && (
          <button
            type="button"
            className="btn btn-sm btn-secondary btn-blue"
            onClick={() => onView(execution)}
          >
            <i className="bi bi-eye me-1" />
            View
          </button>
        )}
      </>
    ),
  },
];

export default function CommandExecutionsPage() {
  const { user, hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState({
    view: false,
  })
  const [selectedCommandExecution, setSelectedCommandExecution] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // set page title
  useEffect(() => {
    document.title = "Command Executions | ServerOps";
  }, []);

  // set search - debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);


  const handlePageSizeChange = newPageSize => {
    setPageSize(newPageSize);
    setPage(1);
  }

  const handleView = (command_execution) => {
    setSelectedCommandExecution(command_execution);

    setModalOpen((prev) => ({
      ...prev,
      view: true,
    }))
  };

  const columns = createColumns({
    hasPermission,
    onView: handleView,
  });

  // call command_executions list api using useQuery
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['command_executions', user.id, page, pageSize, debouncedSearch],

    queryFn: () => command_execution_list({
      page,
      page_size: pageSize,
      search: debouncedSearch,
    }),

    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // separate pagination and data
  const pagination = data?.pagination;

  const command_executions = useMemo(() => {
    const records = data?.data ?? [];

    const currentPage =
      pagination?.page ?? page;

    const currentPageSize =
      pagination?.page_size ?? pageSize;

    const startIndex =
      (currentPage - 1) * currentPageSize;

    return records.map((command_execution, index) => ({
      ...command_execution,
      serial_number: startIndex + index + 1,
    }));
  }, [
    data?.data,
    pagination?.page,
    pagination?.page_size,
    page,
    pageSize,
  ]);

  return (
    <>
      <div className="mb-4">

        <h1 className="txt-blue h3 fw-bold mb-1">Command Executions</h1>

        <p className="text-secondary txt-silver mb-0">Executed Commands</p>
      </div>


      <DataTable
        tableId="command_executions"
        columns={columns}
        rows={command_executions}
        loading={isPending}
        refreshing={isFetching}
        error={
          isError ? error?.response?.data?.message || 'Unable to load Command Executions.' : ''
        }
        emptyMessage="No command_executions found!"
        pagination={pagination}
        onPageChange={setPage}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 15, 25, 50, 75, 100]}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={() => refetch()}
        onSearch={setSearch}
        searchValue={search}
      />

      <ViewModal
        open={modalOpen.view}
        commandExecutionId={selectedCommandExecution?.id}
        onClose={() => {
          setModalOpen(prev => ({
            ...prev,
            view: false
          }));
          setSelectedCommandExecution(null);
        }}
      />

    </>
  );

}