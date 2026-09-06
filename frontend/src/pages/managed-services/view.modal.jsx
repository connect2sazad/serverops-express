import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  managed_service_read,
} from "../../api/managed-services";

import { getApiError } from "../../api/api-error";
import { formatToIST } from "../../components/helpers";

function PermissionBadge({ allowed }) {
  return (
    <span
      className={`badge ${
        allowed
          ? "text-bg-success"
          : "text-bg-secondary"
      }`}
    >
      {allowed ? "Allowed" : "Denied"}
    </span>
  );
}

export default function ViewModal({
  open,
  inventoryId,
  managedServiceId,
  onClose,
}) {
  const {
    data: managedService,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "managed_service",
      inventoryId,
      managedServiceId,
    ],

    queryFn: () =>
      managed_service_read(
        inventoryId,
        managedServiceId
      ),

    enabled:
      open &&
      Boolean(inventoryId) &&
      Boolean(managedServiceId),

    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = event => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.classList.add("modal-open");
    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.classList.remove(
        "modal-open"
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  const inventory = managedService?.inventory;
  const creator = managedService?.creator;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="managed-service-view-title"
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h2
              id="managed-service-view-title"
              className="modal-title fs-5"
            >
              Managed Service Details
            </h2>

            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">
            {isPending && (
              <div className="text-center py-4">
                <div
                  className="spinner-border"
                  role="status"
                />

                <p className="mt-2 mb-0">
                  Loading managed service…
                </p>
              </div>
            )}

            {isError && (
              <div className="alert alert-danger mb-0">
                {getApiError(error).message}
              </div>
            )}

            {!isPending &&
              !isError &&
              managedService && (
                <>
                  <dl className="row mb-4">
                    <dt className="col-sm-4">
                      Service
                    </dt>
                    <dd className="col-sm-8">
                      <strong>
                        {managedService.service_name}
                      </strong>
                    </dd>

                    <dt className="col-sm-4">
                      Inventory
                    </dt>
                    <dd className="col-sm-8">
                      {inventory ? (
                        <>
                          {inventory.name}
                          <small className="d-block text-secondary font-monospace">
                            {inventory.hostname}:
                            {inventory.ssh_port}
                          </small>
                        </>
                      ) : (
                        `#${managedService.inventory_id}`
                      )}
                    </dd>

                    <dt className="col-sm-4">
                      Record status
                    </dt>
                    <dd className="col-sm-8">
                      <span
                        className={`badge ${
                          managedService.status
                            ? "text-bg-success"
                            : "text-bg-danger"
                        }`}
                      >
                        {managedService.status
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </dd>
                  </dl>

                  <h3 className="h6">
                    Allowed Actions
                  </h3>

                  <div className="row g-3 mb-4">
                    {[
                      ["Start", managedService.can_start],
                      ["Stop", managedService.can_stop],
                      ["Restart", managedService.can_restart],
                      ["Enable", managedService.can_enable],
                      ["Disable", managedService.can_disable],
                    ].map(([label, allowed]) => (
                      <div
                        key={label}
                        className="col-6 col-md"
                      >
                        <small className="text-secondary d-block mb-1">
                          {label}
                        </small>

                        <PermissionBadge
                          allowed={allowed}
                        />
                      </div>
                    ))}
                  </div>

                  <dl className="row mb-0">
                    <dt className="col-sm-4">
                      Remarks
                    </dt>
                    <dd className="col-sm-8">
                      {managedService.remarks ?? "—"}
                    </dd>

                    <dt className="col-sm-4">
                      Tags
                    </dt>
                    <dd className="col-sm-8">
                      {Array.isArray(
                        managedService.tags
                      ) &&
                      managedService.tags.length > 0
                        ? managedService.tags.map(
                            (tag, index) => (
                              <span
                                key={`${tag}-${index}`}
                                className="badge rounded-pill bg-blue me-1"
                              >
                                {tag}
                              </span>
                            )
                          )
                        : "—"}
                    </dd>

                    <dt className="col-sm-4">
                      Created By
                    </dt>
                    <dd className="col-sm-8">
                      {creator ? (
                        <>
                          {creator.name}
                          <small className="d-block text-secondary">
                            @{creator.userid}
                          </small>
                        </>
                      ) : (
                        "—"
                      )}
                    </dd>

                    <dt className="col-sm-4">
                      Created At
                    </dt>
                    <dd className="col-sm-8">
                      {formatToIST(
                        managedService.created_at
                      )}
                    </dd>

                    <dt className="col-sm-4">
                      Updated At
                    </dt>
                    <dd className="col-sm-8">
                      {formatToIST(
                        managedService.updated_at
                      )}
                    </dd>
                  </dl>
                </>
              )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
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