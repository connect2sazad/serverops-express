import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import TagsInput from "../../components/tags-input";
import { getApiError } from "../../api/api-error";
import { managed_command_read } from "../../api/managed-commands";

const defaults = { name: "", description: "", command: "", timeout_seconds: 30, remarks: "", tags: [] };

export default function EditModal({ open, inventoryId, managedCommandId, submitting, error, onClose, onSubmit }) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: defaults });
  const query = useQuery({ queryKey: ["managed_command", inventoryId, managedCommandId], queryFn: () => managed_command_read(inventoryId, managedCommandId), enabled: open && Boolean(inventoryId) && Boolean(managedCommandId), retry: false, staleTime: 0 });

  useEffect(() => { if (open && query.data) reset({ name: query.data.name ?? "", description: query.data.description ?? "", command: query.data.command ?? "", timeout_seconds: query.data.timeout_seconds ?? 30, remarks: query.data.remarks ?? "", tags: Array.isArray(query.data.tags) ? query.data.tags : [] }); }, [open, query.data, reset]);
  useEffect(() => {
    if (!open) return undefined;
    const close = event => { if (event.key === "Escape" && !submitting) onClose(); };
    document.body.classList.add("modal-open"); window.addEventListener("keydown", close);
    return () => { document.body.classList.remove("modal-open"); window.removeEventListener("keydown", close); };
  }, [open, submitting, onClose]);
  if (!open) return null;

  return <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" onMouseDown={e => { if (e.target === e.currentTarget && !submitting) onClose(); }} style={{ backgroundColor: "rgba(0,0,0,.5)" }}><div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content shadow">
    <div className="modal-header"><h2 className="modal-title fs-5">Edit Managed Command</h2><button type="button" className="btn-close" disabled={submitting} onClick={onClose} /></div>
    <form noValidate onSubmit={handleSubmit(onSubmit)}><div className="modal-body">
      {error && <div className="alert alert-danger">{getApiError(error).message}</div>}
      {query.isError && <div className="alert alert-danger">{getApiError(query.error).message}</div>}
      {query.isPending ? <p>Loading managed command…</p> : <>
        <div className="mb-3"><label className="form-label" htmlFor="edit-mc-name">Name</label><input id="edit-mc-name" className={`form-control ${errors.name ? "is-invalid" : ""}`} disabled={submitting} {...register("name", { required: "Name is required.", minLength: { value: 3, message: "Name must contain at least 3 characters." }, maxLength: { value: 100, message: "Maximum 100 characters." } })} /><div className="invalid-feedback">{errors.name?.message}</div></div>
        <div className="mb-3"><label className="form-label" htmlFor="edit-mc-description">Description</label><textarea id="edit-mc-description" rows="2" className="form-control" disabled={submitting} {...register("description", { maxLength: { value: 1000, message: "Maximum 1000 characters." } })} /></div>
        <div className="mb-3"><label className="form-label" htmlFor="edit-mc-command">Command</label><textarea id="edit-mc-command" rows="5" className={`form-control font-monospace ${errors.command ? "is-invalid" : ""}`} disabled={submitting} {...register("command", { required: "Command is required.", maxLength: { value: 10000, message: "Maximum 10000 characters." } })} /><div className="invalid-feedback">{errors.command?.message}</div></div>
        <div className="mb-3"><label className="form-label" htmlFor="edit-mc-timeout">Timeout (seconds)</label><input id="edit-mc-timeout" type="number" min="1" max="300" className={`form-control ${errors.timeout_seconds ? "is-invalid" : ""}`} disabled={submitting} {...register("timeout_seconds", { required: "Timeout is required.", valueAsNumber: true, min: { value: 1, message: "Minimum 1 second." }, max: { value: 300, message: "Maximum 300 seconds." } })} /><div className="invalid-feedback">{errors.timeout_seconds?.message}</div></div>
        <div className="mb-3"><label className="form-label" htmlFor="edit-mc-remarks">Remarks</label><textarea id="edit-mc-remarks" rows="2" className="form-control" disabled={submitting} {...register("remarks")} /></div>
        <div className="mb-3"><label className="form-label">Tags</label><Controller name="tags" control={control} render={({ field }) => <TagsInput value={Array.isArray(field.value) ? field.value : []} onChange={field.onChange} disabled={submitting} maxTags={20} error={errors.tags?.message} />} /></div>
      </>}
    </div><div className="modal-footer"><button type="button" className="btn btn-outline-secondary" disabled={submitting} onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary btn-blue" disabled={submitting || query.isPending || query.isError}>{submitting ? "Updating…" : "Update"}</button></div></form>
  </div></div></div>;
}
