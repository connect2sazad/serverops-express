import { useEffect } from "react";

export default function ExecutionResultModal({ open, response, onClose }) {
  useEffect(() => { if (!open) return undefined; const close = event => { if (event.key === "Escape") onClose(); }; document.body.classList.add("modal-open"); window.addEventListener("keydown", close); return () => { document.body.classList.remove("modal-open"); window.removeEventListener("keydown", close); }; }, [open, onClose]);
  if (!open) return null;
  const connection = response?.data?.connection;
  const execution = response?.data?.execution;
  const succeeded = response?.execution_success === true;
  return <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} style={{ backgroundColor: "rgba(0,0,0,.5)" }}><div className="modal-dialog modal-dialog-centered modal-xl"><div className="modal-content shadow">
    <div className="modal-header"><h2 className="modal-title fs-5">Execution Result</h2><button type="button" className="btn-close" onClick={onClose} /></div>
    <div className="modal-body"><div className={`alert ${succeeded ? "alert-success" : "alert-danger"}`}>{response?.message ?? "Execution finished."}</div>
      <div className="row g-3 mb-3"><div className="col-md-3"><small className="text-secondary d-block">Status</small><strong>{connection?.commandStatus ?? execution?.command_status ?? "—"}</strong></div><div className="col-md-3"><small className="text-secondary d-block">Exit Code</small><span>{connection?.exitCode ?? execution?.exit_code ?? "—"}</span></div><div className="col-md-3"><small className="text-secondary d-block">Duration</small><span>{connection?.metadata?.duration ?? execution?.duration ?? "—"} ms</span></div><div className="col-md-3"><small className="text-secondary d-block">Audit ID</small><span>{execution?.id ? `#${execution.id}` : "—"}</span></div></div>
      <h3 className="h6">Command</h3><pre className="border rounded bg-dark text-light p-3 text-wrap">{connection?.command ?? execution?.command ?? "—"}</pre>
      <h3 className="h6">Standard Output</h3><pre className="border rounded bg-dark text-light p-3" style={{ maxHeight: 260, overflow: "auto", whiteSpace: "pre-wrap" }}>{connection?.stdout || "No standard output."}</pre>
      <h3 className="h6">Standard Error</h3><pre className="border rounded bg-dark text-light p-3 mb-0" style={{ maxHeight: 260, overflow: "auto", whiteSpace: "pre-wrap" }}>{connection?.stderr || "No standard error."}</pre>
    </div><div className="modal-footer"><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
  </div></div></div>;
}
