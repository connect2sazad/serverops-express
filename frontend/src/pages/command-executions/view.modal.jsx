import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  command_execution_read,
} from "../../api/command_executions";

import { getApiError } from "../../api/api-error";
import { formatToIST } from "../../components/helpers";

function StatusBadge({ status }) {
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
}

function OutputBlock({
  title,
  value,
  emptyMessage,
}) {
  return (
    <div className="mb-3">
      <h3 className="h6">{title}</h3>

      <pre
        className="border rounded bg-dark text-light p-3 mb-0"
        style={{
          maxHeight: "300px",
          overflow: "auto",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {value || emptyMessage}
      </pre>
    </div>
  );
}

export default function ViewModal({
  open,
  commandExecutionId,
  onClose,
}) {
  const {
    data,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "command_execution",
      commandExecutionId,
    ],

    queryFn: () =>
      command_execution_read(
        commandExecutionId
      ),

    enabled:
      open &&
      Boolean(commandExecutionId),

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

  /*
   * This supports either:
   * return response.data.data
   * or:
   * return response.data
   */
  const execution =
    data?.data?.data ??
    data?.data ??
    data;

  const inventory = execution?.inventory;
  const credential = execution?.credential;
  const creator = execution?.creator;
  const managedCommand =
    execution?.managed_command;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-execution-view-title"
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h2
              id="command-execution-view-title"
              className="modal-title fs-5"
            >
              Command Execution Details
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
              <div className="text-center py-5">
                <div
                  className="spinner-border"
                  role="status"
                >
                  <span className="visually-hidden">
                    Loading execution…
                  </span>
                </div>

                <p className="mt-2 mb-0">
                  Loading execution details…
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
              !execution && (
                <div className="alert alert-warning mb-0">
                  Command execution was not found.
                </div>
              )}

            {!isPending &&
              !isError &&
              execution && (
                <>
                  <div className="row g-3 mb-4">
                    <div className="col-md-2">
                      <small className="text-secondary d-block">
                        Execution ID
                      </small>

                      <strong>
                        #{execution.id}
                      </strong>
                    </div>

                    <div className="col-md-2">
                      <small className="text-secondary d-block">
                        Status
                      </small>

                      <StatusBadge
                        status={
                          execution.command_status
                        }
                      />
                    </div>

                    <div className="col-md-2">
                      <small className="text-secondary d-block">
                        Exit Code
                      </small>

                      <span>
                        {execution.exit_code ?? "—"}
                      </span>
                    </div>

                    <div className="col-md-2">
                      <small className="text-secondary d-block">
                        Duration
                      </small>

                      <span>
                        {execution.duration != null
                          ? `${execution.duration} ms`
                          : "—"}
                      </span>
                    </div>

                    <div className="col-md-2">
                      <small className="text-secondary d-block">
                        Started
                      </small>

                      <span>
                        {formatToIST(
                          execution.started_at
                        )}
                      </span>
                    </div>

                    <div className="col-md-2">
                      <small className="text-secondary d-block">
                        Finished
                      </small>

                      <span>
                        {formatToIST(
                          execution.finished_at
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="h6">
                      Command
                    </h3>

                    <div className="border rounded bg-light p-3 font-monospace text-break">
                      {execution.command ?? "—"}
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="border rounded h-100 p-3">
                        <h3 className="h6">
                          Inventory
                        </h3>

                        {inventory ? (
                          <>
                            <div>
                              <strong>
                                {inventory.name}
                              </strong>
                            </div>

                            <div className="font-monospace">
                              {inventory.hostname}:
                              {inventory.ssh_port}
                            </div>

                            <small className="text-secondary">
                              {inventory.environment ??
                                "No environment"}
                            </small>
                          </>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="border rounded h-100 p-3">
                        <h3 className="h6">
                          Credential
                        </h3>

                        {credential ? (
                          <>
                            <div>
                              <strong>
                                {credential.username}
                              </strong>
                            </div>

                            <div className="text-capitalize">
                              {credential.type?.replace(
                                "-",
                                " "
                              )}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="border rounded h-100 p-3">
                        <h3 className="h6">
                          Executed By
                        </h3>

                        {creator ? (
                          <>
                            <div>
                              <strong>
                                {creator.name}
                              </strong>
                            </div>

                            <div>
                              @{creator.userid}
                            </div>

                            <small className="text-secondary">
                              {creator.email}
                            </small>
                          </>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                  </div>

                  {managedCommand && (
                    <div className="alert alert-primary">
                      <strong>
                        Managed command:
                      </strong>{" "}
                      {managedCommand.name}

                      {managedCommand.description && (
                        <div className="mt-1">
                          {managedCommand.description}
                        </div>
                      )}
                    </div>
                  )}

                  <OutputBlock
                    title="Standard Output"
                    value={execution.stdout}
                    emptyMessage="No standard output."
                  />

                  <OutputBlock
                    title="Standard Error"
                    value={execution.stderr}
                    emptyMessage="No standard error."
                  />

                  {execution.remarks && (
                    <div className="mb-3">
                      <h3 className="h6">
                        Remarks
                      </h3>

                      <div className="border rounded p-3">
                        {execution.remarks}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="h6">Tags</h3>

                    {Array.isArray(execution.tags) &&
                    execution.tags.length > 0 ? (
                      execution.tags.map(
                        (tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="badge rounded-pill bg-blue me-1 mb-1"
                          >
                            {tag}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-secondary">
                        No tags
                      </span>
                    )}
                  </div>
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