import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { managed_command_read } from "../../api/managed-commands";
import { getApiError } from "../../api/api-error";
import { formatToIST } from "../../components/helpers";

export default function ViewModal({ open, inventoryId, managedCommandId, onClose }) {
  const query = useQuery({ queryKey: ["managed_command", inventoryId, managedCommandId], queryFn: () => managed_command_read(inventoryId, managedCommandId), enabled: open && Boolean(inventoryId) && Boolean(managedCommandId), retry: false, staleTime: 0 });
  useEffect(() => { if (!open) return undefined; const close = event => { if (event.key === "Escape") onClose(); }; document.body.classList.add("modal-open"); window.addEventListener("keydown", close); return () => { document.body.classList.remove("modal-open"); window.removeEventListener("keydown", close); }; }, [open, onClose]);
  if (!open) return null;
  const record = query.data;
  return <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} style={{ backgroundColor: "rgba(0,0,0,.5)" }}><div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content shadow">
    <div className="modal-header"><h2 className="modal-title fs-5">Managed Command Details</h2><button type="button" className="btn-close" onClick={onClose} /></div>
    <div className="modal-body">
      {query.isPending && <p>Loading managed command…</p>}
      {query.isError && <div className="alert alert-danger">{getApiError(query.error).message}</div>}
      {record && <><dl className="row mb-3">
        <dt className="col-sm-4">Name</dt><dd className="col-sm-8">{record.name}</dd>
        <dt className="col-sm-4">Description</dt><dd className="col-sm-8">{record.description ?? "—"}</dd>
        <dt className="col-sm-4">Timeout</dt><dd className="col-sm-8">{record.timeout_seconds} seconds</dd>
        <dt className="col-sm-4">Status</dt><dd className="col-sm-8"><span className={`badge ${record.status ? "text-bg-success" : "text-bg-danger"}`}>{record.status ? "Active" : "Inactive"}</span></dd>
        <dt className="col-sm-4">Inventory</dt><dd className="col-sm-8">{record.inventory ? `${record.inventory.name} (${record.inventory.hostname}:${record.inventory.ssh_port})` : `#${record.inventory_id}`}</dd>
        <dt className="col-sm-4">Creator</dt><dd className="col-sm-8">{record.creator ? `${record.creator.name} (@${record.creator.userid})` : "—"}</dd>
        <dt className="col-sm-4">Remarks</dt><dd className="col-sm-8">{record.remarks ?? "—"}</dd>
        <dt className="col-sm-4">Created</dt><dd className="col-sm-8">{formatToIST(record.created_at)}</dd>
        <dt className="col-sm-4">Updated</dt><dd className="col-sm-8">{formatToIST(record.updated_at)}</dd>
      </dl><h3 className="h6">Command</h3><pre className="border rounded bg-dark text-light p-3 text-wrap">{record.command}</pre><h3 className="h6">Tags</h3><div>{Array.isArray(record.tags) && record.tags.length ? record.tags.map((tag, index) => <span key={`${tag}-${index}`} className="badge rounded-pill bg-blue me-1">{tag}</span>) : "—"}</div></>}
    </div><div className="modal-footer"><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
  </div></div></div>;
}
