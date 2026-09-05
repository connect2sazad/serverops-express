import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { credential_read } from "../../api/credentials";
import { inventory_read } from "../../api/inventories";

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
    credentialId,
    onClose,
}) {

    const {
        data: credential,
        isPending,
        isError,
        error
    } = useQuery({
        queryKey: ['credential', credentialId],
        queryFn: () => credential_read(credentialId),
        enabled: open && Boolean(credentialId),
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
            <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="credential-title" onMouseDown={event => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}>

                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow">
                        <div className="modal-header">
                            <h2 id="credential-title" className="modal-title fs-5">Credential Details</h2>
                            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
                        </div>

                        <div className="modal-body">

                            {isPending ? (
                                <div className="d-flex align-items-center gap-2" role="status">
                                    <div className="spinner-border spinner-border-sm" aria-hidden="true" />
                                    <span>Loading credential details...</span>
                                </div>
                            ) : isError ? (
                                <div className="alert alert-danger mb-0" role="alert">
                                    {error?.response?.data?.message || 'Unable to load credential details.'}
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">

                                        <h3 className="h4 mb-1">{credential.username}&emsp;

                                            <span
                                                className={`fs-6 badge ${credential.status ? 'bg-blue' : 'bg-red'}`}
                                            >
                                                {credential.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </h3>

                                    </div>

                                    <dl className="row mb-0">
                                        {credential.type && (<Detail label="Credential Type"><span className="text-uppercase">{credential.type}</span></Detail>)}
                                        {credential.passphrase && (<Detail label="Passphrase">Present</Detail>)}
                                        {credential.inventory.hostname && (<Detail label="Inventory">{credential.inventory.hostname}</Detail>)}
                                        {credential.remarks && (<Detail label="Remarks">{credential.remarks}</Detail>)}
                                        {credential.creator.userid && (<Detail label="Creator">@{credential.creator.userid}</Detail>)}

                                        {
                                            Array.isArray(credential.tags) &&
                                            credential.tags.length > 0 && (
                                                <Detail label="Tags">
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {credential.tags.map(tag => (
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

                        </div>
                    </div>
                </div>

            </div>

            <div className="modal-backdrop show" aria-hidden="true"></div>
        </>
    );
}