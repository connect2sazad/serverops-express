import {
    useEffect,
} from 'react';

import {
    Controller,
    useForm,
} from 'react-hook-form';

import {
    useQuery,
} from '@tanstack/react-query';

import {
    getApiError,
} from '../../api/api-error';

import {
    user_read,
} from '../../api/users';

import PermissionsInput from
    '../../components/permissions-input';

import {
    PERMISSIONS,
} from '../../config/permissions';


const defaultValues = {
    individual_permissions: [],
};


export default function PermissionsModal({
    open,
    userId,
    submitting,
    error,
    onClose,
    onSubmit,
}) {
    const {
        control,
        handleSubmit,
        reset,
        formState: {
            errors,
        },
    } = useForm({
        defaultValues,
    });

    const userQuery = useQuery({
        queryKey: [
            'user',
            userId,
        ],

        queryFn: () =>
            user_read(userId),

        enabled:
            open &&
            Boolean(userId),

        retry:
            false,

        staleTime:
            0,
    });

    useEffect(() => {
        if (
            open &&
            userQuery.data
        ) {
            reset({
                individual_permissions:
                    Array.isArray(
                        userQuery.data
                            .individual_permissions
                    )
                        ? userQuery.data
                            .individual_permissions
                        : [],
            });
        }
    }, [
        open,
        userQuery.data,
        reset,
    ]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleKeyDown =
            event => {
                if (
                    event.key ===
                        'Escape' &&
                    !submitting
                ) {
                    onClose();
                }
            };

        document.body.classList.add(
            'modal-open'
        );

        window.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.body.classList.remove(
                'modal-open'
            );

            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [
        open,
        submitting,
        onClose,
    ]);

    if (!open) {
        return null;
    }

    const user =
        userQuery.data;

    const rolePermissions =
        Array.isArray(
            user?.role?.permissions
        )
            ? user.role.permissions
            : [];

    const roleHasFullAccess =
        rolePermissions.includes(
            PERMISSIONS.ALL
        );

    const submitForm =
        values => {
            onSubmit(
                values
                    .individual_permissions
            );
        };

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-permissions-title"
            style={{
                backgroundColor:
                    'rgba(0, 0, 0, 0.5)',
            }}
            onMouseDown={event => {
                if (
                    event.target ===
                        event.currentTarget &&
                    !submitting
                ) {
                    onClose();
                }
            }}
        >
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
                <div className="modal-content shadow">
                    <div className="modal-header">
                        <div>
                            <h2
                                id="user-permissions-title"
                                className="modal-title fs-5"
                            >
                                Individual Permissions
                            </h2>

                            {user && (
                                <div className="small text-secondary mt-1">
                                    {user.name}{' '}
                                    (@{user.userid})
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            disabled={submitting}
                            onClick={onClose}
                        />
                    </div>

                    <form
                        noValidate
                        onSubmit={
                            handleSubmit(
                                submitForm
                            )
                        }
                    >
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger">
                                    {
                                        getApiError(
                                            error
                                        ).message
                                    }
                                </div>
                            )}

                            {userQuery.isError && (
                                <div className="alert alert-danger">
                                    {
                                        getApiError(
                                            userQuery.error
                                        ).message
                                    }
                                </div>
                            )}

                            {userQuery.isPending ? (
                                <div className="d-flex align-items-center gap-2 py-4">
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        aria-hidden="true"
                                    />

                                    <span>
                                        Loading user permissions…
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="card mb-3">
                                        <div className="card-body">
                                            <div className="small text-secondary">
                                                Assigned Role
                                            </div>

                                            <div className="fw-semibold mt-1">
                                                {
                                                    user?.role
                                                        ?.name ??
                                                    'No role'
                                                }
                                            </div>

                                            <div className="small font-monospace text-secondary">
                                                {
                                                    user?.role
                                                        ?.slug ??
                                                    '—'
                                                }
                                            </div>

                                            <div className="mt-2">
                                                {roleHasFullAccess ? (
                                                    <span className="badge text-bg-danger">
                                                        Role has
                                                        full access
                                                    </span>
                                                ) : (
                                                    <span className="badge text-bg-secondary">
                                                        {
                                                            rolePermissions
                                                                .length
                                                        }{' '}
                                                        role
                                                        permissions
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {roleHasFullAccess && (
                                        <div className="alert alert-warning">
                                            This user already
                                            inherits full access
                                            from the assigned
                                            role. Individual
                                            permissions are
                                            unnecessary until
                                            the role changes.
                                        </div>
                                    )}

                                    <div className="alert alert-info">
                                        Individual permissions
                                        are added to the
                                        permissions inherited
                                        from the assigned role.
                                        They do not remove role
                                        permissions.
                                    </div>

                                    <Controller
                                        name="individual_permissions"
                                        control={control}
                                        defaultValue={[]}
                                        render={({
                                            field,
                                        }) => (
                                            <PermissionsInput
                                                value={
                                                    Array.isArray(
                                                        field.value
                                                    )
                                                        ? field.value
                                                        : []
                                                }
                                                onChange={
                                                    field.onChange
                                                }
                                                disabled={
                                                    submitting
                                                }
                                                allowFullAccess={
                                                    false
                                                }
                                                error={
                                                    errors
                                                        .individual_permissions
                                                        ?.message
                                                }
                                            />
                                        )}
                                    />
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={submitting}
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary btn-blue"
                                disabled={
                                    submitting ||
                                    userQuery.isPending ||
                                    userQuery.isError
                                }
                            >
                                {submitting
                                    ? 'Saving…'
                                    : 'Save Permissions'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}