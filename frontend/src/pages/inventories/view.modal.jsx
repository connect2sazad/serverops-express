import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { inventory_read } from "../../api/inventories";
import { formatToIST } from "../../components/helpers";

function Detail({ label, children }) {
    return (
        <>
            <dt className="col-sm-4 text-secondary txt-silver text-uppercase">
                {label}
            </dt>

            <dd className="col-sm-8">
                {children ?? '—'}
            </dd>
        </>
    );
}

export default function ViewModal({
    open,
    inventoryId,
    onClose,
}) {

    const {
        data: inventory,
        isPending,
        isError,
        error
    } = useQuery({
        queryKey: ['inventory', inventoryId],
        queryFn: () => inventory_read(inventoryId),
        enabled: open && Boolean(inventoryId),
        retry: false,
    });

    // opening the modal
    useEffect(() => {

        if (!open) return undefined;

        const handleKeyDown = event => {
            if (event.key === 'Escape') onClose();
        }

        document.body.classList.add('modal-open');
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, onClose]);

    if (!open) return null;

    return (
        <>
            <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="inventory-title" onMouseDown={event => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}>

                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow">
                        <div className="modal-header">
                            <h2 id="inventory-title" className="modal-title fs-5">Inventory Details</h2>
                            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
                        </div>

                        <div className="modal-body">

                            {isPending ? (
                                <div className="d-flex align-items-center gap-2" role="status">
                                    <div className="spinner-border spinner-border-sm" aria-hidden="true" />
                                    <span>Loading inventory details...</span>
                                </div>
                            ) : isError ? (
                                <div className="alert alert-danger mb-0" role="alert">
                                    {error?.response?.data?.message || 'Unable to load inventory details.'}
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">

                                        <h3 className="h4 mb-1">{inventory.name}&emsp;

                                            <span
                                                className={`fs-6 badge ${inventory.status ? 'bg-blue' : 'bg-red'}`}
                                            >
                                                {inventory.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </h3>

                                    </div>

                                    <dl className="row mb-0">
                                        <Detail label="Hostname">{inventory.hostname}</Detail>
                                        <Detail label="SSH Port">{inventory.ssh_port}</Detail>
                                        <Detail label="Environment">{inventory.environment}</Detail>
                                        {inventory.last_connected_at && (<Detail label="Last Connected At">{formatToIST(inventory.last_connected_at)}</Detail>)}
                                        {inventory.operating_system && (<Detail label="Operating System">{inventory.operating_system}</Detail>)}
                                        {inventory.description && (<Detail label="Description">{inventory.description}</Detail>)}
                                        {inventory.discovered_hostname && (<Detail label="Discovered Hostname">{inventory.discovered_hostname}</Detail>)}
                                        {inventory.os_name && (<Detail label="OS Name">{inventory.os_name}</Detail>)}
                                        {inventory.os_version && (<Detail label="OS Version">{inventory.os_version}</Detail>)}
                                        {inventory.os_version_id && (<Detail label="OS Version ID">{inventory.os_version_id}</Detail>)}
                                        {inventory.kernel && (<Detail label="Kernel">{inventory.kernel}</Detail>)}
                                        {inventory.architecture && (<Detail label="Architecture">{inventory.architecture}</Detail>)}
                                        {inventory.cpu_cores && (<Detail label="CPU Cores">{inventory.cpu_cores}</Detail>)}
                                        {inventory.memory_total_kib && (<Detail label="Total Memory">{inventory.memory_total_kib} KiB</Detail>)}
                                        {inventory.uptime_seconds && (<Detail label="Uptime">{inventory.uptime_seconds} seconds</Detail>)}
                                        {inventory.remarks && (<Detail label="Remarks">{inventory.remarks}</Detail>)}

                                        {
                                            Array.isArray(inventory.tags) &&
                                            inventory.tags.length > 0 && (
                                                <Detail label="Tags">
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {inventory.tags.map(tag => (
                                                            <span className="badge rounded-pill bg-blue" key={tag}>
                                                                {tag}
                                                            </span>
                                                        ))
                                                        }
                                                    </div>
                                                </Detail>
                                            )
                                        }
                                    </dl>
                                </>
                            )

                            }

                        </div>


                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            {/* <button
                                type="button"
                                className="btn btn-outline-secondary btn-blue-outline"
                                onClick={onClose}
                            >
                                Edit
                            </button> */}

                        </div>
                    </div>
                </div>

            </div>

            <div className="modal-backdrop show" aria-hidden="true"></div>
        </>
    );
}