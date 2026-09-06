import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { process_read } from "../../api/processes";
import { getApiError } from "../../api/api-error";

function formatMemory(kib) {
  if (kib == null) return "—";

  return `${(Number(kib) / 1024).toFixed(2)} MiB`;
}

export default function ViewModal({
  open,
  inventoryId,
  pid,
  onClose,
}) {
  const {
    data,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "inventory_process",
      inventoryId,
      pid,
    ],

    queryFn: () =>
      process_read(inventoryId, pid),

    enabled:
      open &&
      Boolean(inventoryId) &&
      Boolean(pid),

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

  const process = data?.data?.process;
  const metadata = data?.data?.metadata;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="process-view-title"
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
              id="process-view-title"
              className="modal-title fs-5"
            >
              Process Details
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
                >
                  <span className="visually-hidden">
                    Loading process…
                  </span>
                </div>

                <p className="mt-2 mb-0">
                  Loading process details…
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
              !process && (
                <div className="alert alert-warning mb-0">
                  This process is no longer running.
                </div>
              )}

            {!isPending &&
              !isError &&
              process && (
                <dl className="row mb-0">
                  <dt className="col-sm-4">
                    PID
                  </dt>
                  <dd className="col-sm-8">
                    {process.pid}
                  </dd>

                  <dt className="col-sm-4">
                    Parent PID
                  </dt>
                  <dd className="col-sm-8">
                    {process.ppid ?? "—"}
                  </dd>

                  <dt className="col-sm-4">
                    User
                  </dt>
                  <dd className="col-sm-8">
                    {process.user ?? "—"}
                  </dd>

                  <dt className="col-sm-4">
                    CPU usage
                  </dt>
                  <dd className="col-sm-8">
                    {process.cpu_percent != null
                      ? `${process.cpu_percent}%`
                      : "—"}
                  </dd>

                  <dt className="col-sm-4">
                    Memory usage
                  </dt>
                  <dd className="col-sm-8">
                    {process.memory_percent != null
                      ? `${process.memory_percent}%`
                      : "—"}
                  </dd>

                  <dt className="col-sm-4">
                    Resident memory
                  </dt>
                  <dd className="col-sm-8">
                    {formatMemory(
                      process.resident_memory
                    )}
                  </dd>

                  <dt className="col-sm-4">
                    Virtual memory
                  </dt>
                  <dd className="col-sm-8">
                    {formatMemory(
                      process.virtual_memory
                    )}
                  </dd>

                  <dt className="col-sm-4">
                    State
                  </dt>
                  <dd className="col-sm-8">
                    <span className="badge text-bg-secondary">
                      {process.state ?? "unknown"}
                    </span>
                  </dd>

                  <dt className="col-sm-4">
                    TTY
                  </dt>
                  <dd className="col-sm-8">
                    {process.tty ?? "—"}
                  </dd>

                  <dt className="col-sm-4">
                    Started
                  </dt>
                  <dd className="col-sm-8">
                    {process.started_at ?? "—"}
                  </dd>

                  <dt className="col-sm-4">
                    CPU time
                  </dt>
                  <dd className="col-sm-8">
                    {process.cpu_time ?? "—"}
                  </dd>

                  <dt className="col-sm-4">
                    Command
                  </dt>
                  <dd className="col-sm-8">
                    <div className="border rounded bg-light p-2 font-monospace text-break">
                      {process.command ?? "—"}
                    </div>
                  </dd>

                  <dt className="col-sm-4">
                    Request duration
                  </dt>
                  <dd className="col-sm-8">
                    {metadata?.duration != null
                      ? `${metadata.duration} ms`
                      : "—"}
                  </dd>
                </dl>
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