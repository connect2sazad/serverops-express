import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { inventory_read } from '../../api/inventories';

export default function InventoryViewPage() {
    const { id } = useParams();

    useEffect(() => {
        document.title = 'Inventory Details | ServerOps';
    }, []);

    const {
        data: inventory,
        isPending,
        isError,
        error,
    } = useQuery({
        queryKey: ['inventory', id],
        queryFn: () => inventory_read(id),
        retry: false,
    });

    if (isPending) {
        return <p role="status">Loading inventory…</p>;
    }

    if (isError) {
        return (
            <div className="alert alert-danger" role="alert">
                {error?.response?.data?.message ||
                    'Unable to load inventory.'}
            </div>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">
                        {inventory.name}
                    </h1>

                    <p className="text-secondary mb-0">
                        Inventory details
                    </p>
                </div>

                <Link
                    className="btn btn-outline-secondary"
                    to="/inventories"
                >
                    Back
                </Link>
            </div>

            <div className="card">
                <div className="card-body">
                    <dl className="row mb-0">
                        <dt className="col-sm-4">Hostname</dt>
                        <dd className="col-sm-8">
                            {inventory.hostname}
                        </dd>

                        <dt className="col-sm-4">SSH port</dt>
                        <dd className="col-sm-8">
                            {inventory.ssh_port}
                        </dd>

                        <dt className="col-sm-4">Environment</dt>
                        <dd className="col-sm-8">
                            {inventory.environment || '—'}
                        </dd>

                        <dt className="col-sm-4">
                            Operating system
                        </dt>
                        <dd className="col-sm-8">
                            {inventory.operating_system || '—'}
                        </dd>

                        <dt className="col-sm-4">
                            Connection status
                        </dt>
                        <dd className="col-sm-8">
                            {inventory.connection_status || 'Unknown'}
                        </dd>

                        <dt className="col-sm-4">Description</dt>
                        <dd className="col-sm-8">
                            {inventory.description || '—'}
                        </dd>
                    </dl>
                </div>
            </div>
        </>
    );
}