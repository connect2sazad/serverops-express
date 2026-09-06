import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import useConfirmation from "../../hooks/useConfirmation";
import { useAuth } from "../../hooks/useAuth";
import DataTable from "../../components/data-table";
import { inventory_read } from "../../api/inventories";
import { service_list, service_action } from "../../api/services";
import { getApiError } from "../../api/api-error";

import ViewModal from './view.modal';
import { PERMISSIONS } from "../../config/permissions";

const createColumns = ({
  hasPermission,
  onView,
  onAction,
  runningAction
}) => [
    {
      key: "serial_number",
      label: "Sl. No.",
      hideable: false,
    },
    {
      key: "name",
      label: "Service",
      hideable: false,
    },
    {
      key: "unit",
      label: "Unit",
    },
    {
      key: "description",
      label: "Description",
      defaultVisible: false,
    },
    {
      key: "load",
      label: "Load",
      render: service => (
        <span
          className={`badge ${service.load === "loaded"
            ? "text-bg-success"
            : "text-bg-secondary"
            }`}
        >
          {service.load}
        </span>
      ),
    },
    {
      key: "active",
      label: "Active State",
      render: service => (
        <span
          className={`badge ${service.active === "active"
            ? "text-bg-success"
            : service.active === "failed"
              ? "text-bg-danger"
              : "text-bg-secondary"
            }`}
        >
          {service.active}
        </span>
      ),
    },
    {
      key: "sub",
      label: "Sub State",
    },
    {
      key: "actions",
      label: "Actions",
      hideable: false,
      render: service => {
        const isRunning = action =>
          runningAction ===
          `${service.name}:${action}`;

        const anyActionRunning =
          runningAction !== null;

        return (
          <div className="d-flex flex-wrap gap-1">
            {hasPermission(
              PERMISSIONS.SERVICES_READ
            ) && (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary btn-blue"
                  disabled={anyActionRunning}
                  onClick={() => onView(service)}
                >
                  <i className="bi bi-eye me-1" />
                  View
                </button>
              )}

            {hasPermission(
              PERMISSIONS.SERVICES_START
            ) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  disabled={
                    anyActionRunning ||
                    service.active === "active"
                  }
                  onClick={() =>
                    onAction(service, "start")
                  }
                >
                  <i className="bi bi-play-fill me-1" />
                  {isRunning("start")
                    ? "Starting…"
                    : "Start"}
                </button>
              )}

            {hasPermission(
              PERMISSIONS.SERVICES_STOP
            ) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  disabled={
                    anyActionRunning ||
                    service.active !== "active"
                  }
                  onClick={() =>
                    onAction(service, "stop")
                  }
                >
                  <i className="bi bi-stop-fill me-1" />
                  {isRunning("stop")
                    ? "Stopping…"
                    : "Stop"}
                </button>
              )}

            {hasPermission(
              PERMISSIONS.SERVICES_RESTART
            ) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  disabled={
                    anyActionRunning ||
                    service.active !== "active"
                  }
                  onClick={() =>
                    onAction(service, "restart")
                  }
                >
                  <i className="bi bi-arrow-clockwise me-1" />
                  {isRunning("restart")
                    ? "Restarting…"
                    : "Restart"}
                </button>
              )}

            {hasPermission(
              PERMISSIONS.SERVICES_ENABLE
            ) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  disabled={anyActionRunning}
                  onClick={() =>
                    onAction(service, "enable")
                  }
                >
                  <i className="bi bi-toggle-on me-1" />
                  {isRunning("enable")
                    ? "Enabling…"
                    : "Enable"}
                </button>
              )}

            {hasPermission(
              PERMISSIONS.SERVICES_DISABLE
            ) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={anyActionRunning}
                  onClick={() =>
                    onAction(service, "disable")
                  }
                >
                  <i className="bi bi-toggle-off me-1" />
                  {isRunning("disable")
                    ? "Disabling…"
                    : "Disable"}
                </button>
              )}
          </div>
        );
      },
    },
  ];

export default function ServicesPage() {
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const [selectedService, setSelectedService] = useState(null);
  const queryClient = useQueryClient();
  const { confirm } = useConfirmation();
  const [runningAction, setRunningAction] = useState(null);

  useEffect(() => {
    document.title = "Services | ServerOps";
  }, []);

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["inventory_services", id],
    queryFn: () => service_list(id),
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

  const services = data?.data?.services ?? [];
  const metadata = data?.data?.metadata;

  const filteredServices = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return services;
    }

    return services.filter(service =>
      [
        service.name,
        service.unit,
        service.description,
        service.load,
        service.active,
        service.sub,
      ].some(value =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch)
      )
    );
  }, [services, search]);

  const total = filteredServices.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedServices = useMemo(() => {
    const startIndex = (page - 1) * pageSize;

    return filteredServices
      .slice(startIndex, startIndex + pageSize)
      .map((service, index) => ({
        ...service,
        serial_number: startIndex + index + 1,
      }));
  }, [
    filteredServices,
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
    mutationFn: ({
      serviceName,
      action,
      reason,
    }) =>
      service_action(
        id,
        serviceName,
        action,
        reason
      ),

    onSuccess: async response => {
      toast.success(
        response?.message ??
        "Service action completed successfully."
      );

      await queryClient.invalidateQueries({
        queryKey: ["inventory_services", id],
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

  const handleServiceAction = async (
    service,
    action
  ) => {
    if (actionMutation.isPending) return;

    const labels = {
      start: "Start",
      stop: "Stop",
      restart: "Restart",
      enable: "Enable",
      disable: "Disable",
    };

    const actionLabel = labels[action];

    if (!actionLabel) return;

    const { confirmed, inputValue: reason } =
      await confirm({
        title: `${actionLabel} service?`,
        message: (
          <>
            You are about to{" "}
            <strong>{action}</strong>{" "}
            the service{" "}
            <strong>{service.name}</strong>.
          </>
        ),
        confirmLabel: actionLabel,
        variant:
          action === "stop" || action === "disable"
            ? "danger"
            : "warning",
        input: {
          label: "Reason",
          placeholder:
            "Why is this action being performed?",
          required: false,
          type: "text",
          maxLength: 500,
        },
      });

    if (!confirmed) return;

    setRunningAction(
      `${service.name}:${action}`
    );

    actionMutation.mutate({
      serviceName: service.name,
      action,
      reason,
    });
  };

  const columns = createColumns({
    hasPermission,
    onView: service => setSelectedService(service),
    onAction: handleServiceAction,
    runningAction,
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="h3 fw-bold txt-blue mb-1">
            Services
          </h1>

          <p className="text-secondary mb-0">
            Services running on this inventory
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
        tableId={`inventory-${id}-services`}
        columns={columns}
        rows={paginatedServices}
        rowKey="unit"
        loading={isPending}
        refreshing={isFetching}
        error={
          isError
            ? getApiError(error).message
            : ""
        }
        emptyMessage={
          search
            ? "No services match your search."
            : "No services found."
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
        open={Boolean(selectedService)}
        inventoryId={id}
        serviceName={selectedService?.name}
        onClose={() => setSelectedService(null)}
      />
    </>
  );
}