import {
    useEffect,
    useMemo,
} from 'react';

import {
    Controller,
    useForm,
} from 'react-hook-form';

import {
    useQuery,
} from '@tanstack/react-query';

import Select from 'react-select';

import {
    getApiError,
} from '../../api/api-error';

import {
    user_role_list,
} from '../../api/user-roles';


const defaultValues = {
    name: '',
    email: '',
    userid: '',
    password: '',
    confirm_password: '',
    user_role_id: null,
};


const selectStyles = {
    menuPortal: base => ({
        ...base,
        zIndex: 9999,
    }),
};


export default function CreateModal({
    open,
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
        watch,
        formState: {
            errors,
        },
    } = useForm({
        defaultValues,
    });

    const password =
        watch('password');

    const rolesQuery = useQuery({
        queryKey: [
            'user_roles',
            'active-options',
        ],

        queryFn: () =>
            user_role_list({
                page: 1,
                page_size: 100,
                search: '',
            }),

        enabled:
            open,

        retry:
            false,

        staleTime:
            30_000,
    });

    const roleOptions =
        useMemo(() => {
            const roles =
                rolesQuery.data?.data ??
                [];

            return roles
                .filter(
                    role =>
                        role.status
                )
                .map(
                    role => ({
                        value:
                            role.id,

                        label:
                            `${role.name} (${role.slug})`,
                    })
                );
        }, [
            rolesQuery.data,
        ]);

    useEffect(() => {
        if (open) {
            reset(defaultValues);
        }
    }, [
        open,
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

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-title"
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
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content shadow">
                    <div className="modal-header">
                        <h2
                            id="create-user-title"
                            className="modal-title fs-5"
                        >
                            Add User
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
                            handleSubmit(
                                onSubmit
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

                            {rolesQuery.isError && (
                                <div className="alert alert-danger">
                                    {
                                        getApiError(
                                            rolesQuery.error
                                        ).message
                                    }
                                </div>
                            )}

                            <div className="mb-3">
                                <label
                                    className="form-label"
                                    htmlFor="create-user-name"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="create-user-name"
                                    type="text"
                                    autoFocus
                                    autoComplete="name"
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
                                                'Name is required.',

                                            minLength: {
                                                value: 3,
                                                message:
                                                    'Name must contain at least 3 characters.',
                                            },

                                            maxLength: {
                                                value: 100,
                                                message:
                                                    'Name cannot exceed 100 characters.',
                                            },

                                            setValueAs:
                                                value =>
                                                    value.trim(),
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

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label
                                        className="form-label"
                                        htmlFor="create-user-email"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="create-user-email"
                                        type="email"
                                        autoComplete="email"
                                        disabled={
                                            submitting
                                        }
                                        className={
                                            `form-control ${
                                                errors.email
                                                    ? 'is-invalid'
                                                    : ''
                                            }`
                                        }
                                        {...register(
                                            'email',
                                            {
                                                required:
                                                    'Email address is required.',

                                                pattern: {
                                                    value:
                                                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                                                    message:
                                                        'Enter a valid email address.',
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
                                            errors.email
                                                ?.message
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label
                                        className="form-label"
                                        htmlFor="create-user-userid"
                                    >
                                        User ID
                                    </label>

                                    <input
                                        id="create-user-userid"
                                        type="text"
                                        autoComplete="off"
                                        disabled={
                                            submitting
                                        }
                                        className={
                                            `form-control ${
                                                errors.userid
                                                    ? 'is-invalid'
                                                    : ''
                                            }`
                                        }
                                        {...register(
                                            'userid',
                                            {
                                                required:
                                                    'User ID is required.',

                                                minLength: {
                                                    value: 3,
                                                    message:
                                                        'User ID must contain at least 3 characters.',
                                                },

                                                maxLength: {
                                                    value: 50,
                                                    message:
                                                        'User ID cannot exceed 50 characters.',
                                                },

                                                pattern: {
                                                    value:
                                                        /^[a-zA-Z0-9._-]+$/,

                                                    message:
                                                        'Use letters, numbers, dots, underscores, and hyphens only.',
                                                },

                                                setValueAs:
                                                    value =>
                                                        value.trim(),
                                            }
                                        )}
                                    />

                                    <div className="invalid-feedback">
                                        {
                                            errors.userid
                                                ?.message
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    User Role
                                </label>

                                <Controller
                                    name="user_role_id"
                                    control={control}
                                    rules={{
                                        required:
                                            'User role is required.',
                                    }}
                                    render={({
                                        field,
                                    }) => (
                                        <Select
                                            inputId="create-user-role"
                                            classNamePrefix="react-select"
                                            placeholder={
                                                rolesQuery.isPending
                                                    ? 'Loading roles...'
                                                    : 'Search and select a role'
                                            }
                                            isLoading={
                                                rolesQuery.isPending
                                            }
                                            isDisabled={
                                                submitting ||
                                                rolesQuery.isPending ||
                                                rolesQuery.isError
                                            }
                                            isClearable
                                            options={
                                                roleOptions
                                            }
                                            value={
                                                roleOptions.find(
                                                    option =>
                                                        option.value ===
                                                        field.value
                                                ) ??
                                                null
                                            }
                                            onChange={
                                                option =>
                                                    field.onChange(
                                                        option?.value ??
                                                        null
                                                    )
                                            }
                                            onBlur={
                                                field.onBlur
                                            }
                                            menuPortalTarget={
                                                document.body
                                            }
                                            menuPosition="fixed"
                                            styles={
                                                selectStyles
                                            }
                                        />
                                    )}
                                />

                                {errors.user_role_id && (
                                    <div className="text-danger small mt-1">
                                        {
                                            errors
                                                .user_role_id
                                                .message
                                        }
                                    </div>
                                )}

                                {!rolesQuery.isPending &&
                                    !rolesQuery.isError &&
                                    roleOptions.length ===
                                        0 && (
                                        <div className="text-danger small mt-1">
                                            No active user
                                            roles are
                                            available.
                                        </div>
                                    )}
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label
                                        className="form-label"
                                        htmlFor="create-user-password"
                                    >
                                        Password
                                    </label>

                                    <input
                                        id="create-user-password"
                                        type="password"
                                        autoComplete="new-password"
                                        disabled={
                                            submitting
                                        }
                                        className={
                                            `form-control ${
                                                errors.password
                                                    ? 'is-invalid'
                                                    : ''
                                            }`
                                        }
                                        {...register(
                                            'password',
                                            {
                                                required:
                                                    'Password is required.',

                                                minLength: {
                                                    value: 6,
                                                    message:
                                                        'Password must contain at least 6 characters.',
                                                },

                                                maxLength: {
                                                    value: 100,
                                                    message:
                                                        'Password cannot exceed 100 characters.',
                                                },
                                            }
                                        )}
                                    />

                                    <div className="invalid-feedback">
                                        {
                                            errors.password
                                                ?.message
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label
                                        className="form-label"
                                        htmlFor="create-user-confirm-password"
                                    >
                                        Confirm Password
                                    </label>

                                    <input
                                        id="create-user-confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        disabled={
                                            submitting
                                        }
                                        className={
                                            `form-control ${
                                                errors.confirm_password
                                                    ? 'is-invalid'
                                                    : ''
                                            }`
                                        }
                                        {...register(
                                            'confirm_password',
                                            {
                                                required:
                                                    'Please confirm the password.',

                                                validate:
                                                    value =>
                                                        value ===
                                                            password ||
                                                        'Passwords do not match.',
                                            }
                                        )}
                                    />

                                    <div className="invalid-feedback">
                                        {
                                            errors
                                                .confirm_password
                                                ?.message
                                        }
                                    </div>
                                </div>
                            </div>
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
                                    rolesQuery.isPending ||
                                    rolesQuery.isError ||
                                    roleOptions.length ===
                                        0
                                }
                            >
                                {submitting
                                    ? 'Creating…'
                                    : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}