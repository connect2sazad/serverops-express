import { useEffect } from "react";

export default function HostKeyModal({
    open,
    inventory,
    hostKey,
    loading = false,
    trusting = false,
    error = null,
    allowTrust = false,
    onTrust,
    onClose,
}) {
    useEffect(() => {
        if (!open) return undefined;

        const handleKeyDown = event => {
            if (event.key === "Escape" && !trusting) {
                onClose();
            }
        };

        document.body.classList.add("modal-open");
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.classList.remove("modal-open");
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, trusting, onClose]);

    if (!open) return null;

    const trustStatus = hostKey?.trust_status;
    const presentedFingerprint = hostKey?.presented_fingerprint;
    const trustedFingerprint = hostKey?.trusted_fingerprint;

    const isTrusted = trustStatus === "trusted";
    const isMismatch = trustStatus === "mismatch";
    const canTrust =
        allowTrust &&
        !loading &&
        !trusting &&
        Boolean(presentedFingerprint) &&
        !isTrusted &&
        !isMismatch;

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="host-key-modal-title"
            onMouseDown={event => {
                if (
                    event.target === event.currentTarget &&
                    !trusting
                ) {
                    onClose();
                }
            }}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content shadow">
                    <div className="modal-header">
                        <h2
                            id="host-key-modal-title"
                            className="modal-title fs-5"
                        >
                            SSH Host Key
                        </h2>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            disabled={trusting}
                            onClick={onClose}
                        />
                    </div>

                    <div className="modal-body">
                        <dl className="row mb-4">
                            <dt className="col-sm-4">Inventory</dt>
                            <dd className="col-sm-8">
                                {inventory?.name ?? "—"}
                            </dd>

                            <dt className="col-sm-4">SSH host</dt>
                            <dd className="col-sm-8">
                                {inventory
                                    ? `${inventory.hostname}:${inventory.ssh_port ?? 22}`
                                    : "—"}
                            </dd>
                        </dl>

                        {loading && (
                            <div className="text-center py-4">
                                <div
                                    className="spinner-border"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Inspecting host key…
                                    </span>
                                </div>

                                <p className="mt-2 mb-0">
                                    Inspecting the server host key…
                                </p>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="alert alert-danger mb-0">
                                {error}
                            </div>
                        )}

                        {!loading && !error && hostKey && (
                            <>
                                {isTrusted && (
                                    <div className="alert alert-success">
                                        This server’s presented host key
                                        matches the trusted fingerprint.
                                    </div>
                                )}

                                {trustStatus === "not-trusted" && (
                                    <div className="alert alert-warning">
                                        This server has not been trusted.
                                        Confirm the fingerprint using a
                                        separate trusted source before
                                        continuing.
                                    </div>
                                )}

                                {isMismatch && (
                                    <div className="alert alert-danger">
                                        <strong>Host-key mismatch.</strong>{" "}
                                        The server is presenting a different
                                        key from the trusted fingerprint.
                                        Do not connect until the change has
                                        been investigated.
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Presented fingerprint
                                    </label>

                                    <div className="border rounded bg-light p-3 font-monospace text-break">
                                        {presentedFingerprint ?? "—"}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Trusted fingerprint
                                    </label>

                                    <div className="border rounded bg-light p-3 font-monospace text-break">
                                        {trustedFingerprint ?? "Not trusted"}
                                    </div>
                                </div>

                                <div>
                                    <span className="fw-semibold me-2">
                                        Status:
                                    </span>

                                    <span
                                        className={`badge ${isTrusted
                                            ? "text-bg-success"
                                            : isMismatch
                                                ? "text-bg-danger"
                                                : "text-bg-warning"
                                            }`}
                                    >
                                        {trustStatus ?? "unknown"}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            disabled={trusting}
                            onClick={onClose}
                        >
                            Close
                        </button>

                        {canTrust && (
                            <button
                                type="button"
                                className="btn btn-warning"
                                disabled={trusting}
                                onClick={() =>
                                    onTrust(presentedFingerprint)
                                }
                            >
                                {trusting
                                    ? "Trusting…"
                                    : "Trust This Host Key"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}