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
    user_role_read,
} from '../../api/user-roles';

import PermissionsInput from
    '../../components/permissions-input';

import TagsInput from
    '../../components/tags-input';


const defaultValues = {
    name: '',
    slug: '',
    permissions: [],
    remarks: '',
    tags: [],
};


export default function EditModal({
    open,
    userRoleId,
    submitting,
    error,
    onClose,
    onSubmit,
}) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: {
            errors,
        },
    } = useForm({
        defaultValues,
    });

    const roleQuery = useQuery({
        queryKey: [
            'user_role',
            userRoleId,
        ],

        queryFn: () =>
            user_role_read(
                userRoleId
            ),

        enabled:
            open &&
            Boolean(userRoleId),

        retry: false,
        staleTime: 0,
    });

    useEffect(() => {
        if (
            open &&
            roleQuery.data
        ) {
            reset({
                name:
                    roleQuery.data.name ?? '',

                slug:
                    roleQuery.data.slug ?? '',

                permissions:
                    Array.isArray(
                        roleQuery.data.permissions
                    )
                        ? roleQuery.data.permissions
                        : [],

                remarks:
                    roleQuery.data.remarks ?? '',

                tags:
                    Array.isArray(
                        roleQuery.data.tags
                    )
                        ? roleQuery.data.tags
                        : [],
            });
        }
    }, [
        open,
        roleQuery.data,
        reset,
    ]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleKeyDown = event => {
            if (
                event.key === 'Escape' &&
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

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-role-title"
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
                        <h2
                            id="edit-user-role-title"
                            className="modal-title fs-5"
                        >
                            Edit User Role
                        </h2>

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
                            handleSubmit(onSubmit)
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

                            {roleQuery.isError && (
                                <div className="alert alert-danger">
                                    {
                                        getApiError(
                                            roleQuery.error
                                        ).message
                                    }
                                </div>
                            )}

                            {roleQuery.isPending ? (
                                <div className="d-flex align-items-center gap-2 py-4">
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        aria-hidden="true"
                                    />

                                    <span>
                                        Loading user role…
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="edit-role-name"
                                            >
                                                Role Name
                                            </label>

                                            <input
                                                id="edit-role-name"
                                                type="text"
                                                autoFocus
                                                autoComplete="off"
                                                disabled={
                                                    submitting
                                                }
                                                className={
                                                    `form-control ${
                                                        errors.name
                                                            ? 'is-invalid'
                                                            : ''
                                                    }`
                                                }
                                                {...register(
                                                    'name',
                                                    {
                                                        required:
                                                            'Role name is required.',

                                                        minLength: {
                                                            value: 3,
                                                            message:
                                                                'Role name must contain at least 3 characters.',
                                                        },

                                                        maxLength: {
                                                            value: 50,
                                                            message:
                                                                'Role name cannot exceed 50 characters.',
                                                        },
                                                    }
                                                )}
                                            />

                                            <div className="invalid-feedback">
                                                {
                                                    errors.name
                                                        ?.message
                                                }
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="edit-role-slug"
                                            >
                                                Role Slug
                                            </label>

                                            <input
                                                id="edit-role-slug"
                                                type="text"
                                                autoComplete="off"
                                                disabled={
                                                    submitting
                                                }
                                                className={
                                                    `form-control ${
                                                        errors.slug
                                                            ? 'is-invalid'
                                                            : ''
                                                    }`
                                                }
                                                {...register(
                                                    'slug',
                                                    {
                                                        required:
                                                            'Role slug is required.',

                                                        minLength: {
                                                            value: 3,
                                                            message:
                                                                'Role slug must contain at least 3 characters.',
                                                        },

                                                        maxLength: {
                                                            value: 50,
                                                            message:
                                                                'Role slug cannot exceed 50 characters.',
                                                        },

                                                        pattern: {
                                                            value:
                                                                /^[a-z0-9-]+$/,

                                                            message:
                                                                'Use lowercase letters, numbers, and hyphens only.',
                                                        },

                                                        setValueAs:
                                                            value =>
                                                                value
                                                                    .trim()
                                                                    .toLowerCase(),
                                                    }
                                                )}
                                            />

                                            <div className="invalid-feedback">
                                                {
                                                    errors.slug
                                                        ?.message
                                                }
                                            </div>

                                            <div className="form-text">
                                                Changing the slug
                                                can affect logic that
                                                identifies this role.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Permissions
                                        </label>

                                        <Controller
                                            name="permissions"
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
                                                    error={
                                                        errors
                                                            .permissions
                                                            ?.message
                                                    }
                                                />
                                            )}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            className="form-label"
                                            htmlFor="edit-role-remarks"
                                        >
                                            Remarks
                                        </label>

                                        <textarea
                                            id="edit-role-remarks"
                                            rows="3"
                                            disabled={
                                                submitting
                                            }
                                            placeholder="Optional remarks"
                                            className={
                                                `form-control ${
                                                    errors.remarks
                                                        ? 'is-invalid'
                                                        : ''
                                                }`
                                            }
                                            {...register(
                                                'remarks',
                                                {
                                                    maxLength: {
                                                        value: 1000,
                                                        message:
                                                            'Remarks cannot exceed 1000 characters.',
                                                    },
                                                }
                                            )}
                                        />

                                        <div className="invalid-feedback">
                                            {
                                                errors.remarks
                                                    ?.message
                                            }
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Tags
                                        </label>

                                        <Controller
                                            name="tags"
                                            control={control}
                                            defaultValue={[]}
                                            render={({
                                                field,
                                            }) => (
                                                <TagsInput
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
                                                    maxTags={20}
                                                    error={
                                                        errors.tags
                                                            ?.message
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
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
                                    roleQuery.isPending ||
                                    roleQuery.isError
                                }
                            >
                                {submitting
                                    ? 'Updating…'
                                    : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}