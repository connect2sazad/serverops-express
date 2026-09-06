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
    user_read,
} from '../../api/users';

import {
    user_role_list,
} from '../../api/user-roles';

import {
    useAuth,
} from '../../hooks/useAuth';

import TagsInput from
    '../../components/tags-input';


const defaultValues = {
    name: '',
    email: '',
    userid: '',
    user_role_id: null,
    remarks: '',
    tags: [],
};


const selectStyles = {
    menuPortal: base => ({
        ...base,
        zIndex: 9999,
    }),
};


export default function EditModal({
    open,
    userId,
    submitting,
    error,
    onClose,
    onSubmit,
}) {
    const {
        user: authenticatedUser,
    } = useAuth();

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

    const rolesQuery = useQuery({
        queryKey: [
            'user_roles',
            'edit-options',
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

    const editingOwnAccount =
        Number(authenticatedUser?.id) ===
        Number(userId);

    const roleOptions =
        useMemo(() => {
            const roles =
                rolesQuery.data?.data ??
                [];

            return roles
                .filter(
                    role =>
                        role.status ||
                        role.id ===
                            userQuery.data
                                ?.role?.id
                )
                .map(
                    role => ({
                        value:
                            role.id,

                        label:
                            `${role.name} (${role.slug})${role.status ? '' : ' — inactive'}`,
                    })
                );
        }, [
            rolesQuery.data,
            userQuery.data,
        ]);

    useEffect(() => {
        if (
            open &&
            userQuery.data
        ) {
            reset({
                name:
                    userQuery.data.name ??
                    '',

                email:
                    userQuery.data.email ??
                    '',

                userid:
                    userQuery.data.userid ??
                    '',

                user_role_id:
                    userQuery.data.role
                        ?.id ??
                    null,

                remarks:
                    userQuery.data.remarks ??
                    '',

                tags:
                    Array.isArray(
                        userQuery.data.tags
                    )
                        ? userQuery.data.tags
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

    const loading =
        userQuery.isPending ||
        rolesQuery.isPending;

    const queryError =
        userQuery.isError
            ? userQuery.error
            : rolesQuery.isError
                ? rolesQuery.error
                : null;

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
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
                            id="edit-user-title"
                            className="modal-title fs-5"
                        >
                            Edit User
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

                            {queryError && (
                                <div className="alert alert-danger">
                                    {
                                        getApiError(
                                            queryError
                                        ).message
                                    }
                                </div>
                            )}

                            {loading ? (
                                <div className="d-flex align-items-center gap-2 py-4">
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        aria-hidden="true"
                                    />

                                    <span>
                                        Loading user…
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3">
                                        <label
                                            className="form-label"
                                            htmlFor="edit-user-name"
                                        >
                                            Full Name
                                        </label>

                                        <input
                                            id="edit-user-name"
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
                                                        value: 2,
                                                        message:
                                                            'Name must contain at least 2 characters.',
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
                                                htmlFor="edit-user-email"
                                            >
                                                Email Address
                                            </label>

                                            <input
                                                id="edit-user-email"
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
                                                htmlFor="edit-user-userid"
                                            >
                                                User ID
                                            </label>

                                            <input
                                                id="edit-user-userid"
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
                                                    inputId="edit-user-role"
                                                    classNamePrefix="react-select"
                                                    isClearable={
                                                        !editingOwnAccount
                                                    }
                                                    isDisabled={
                                                        submitting ||
                                                        editingOwnAccount
                                                    }
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

                                        {editingOwnAccount && (
                                            <div className="form-text">
                                                You cannot
                                                change your
                                                own role.
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            className="form-label"
                                            htmlFor="edit-user-remarks"
                                        >
                                            Remarks
                                        </label>

                                        <textarea
                                            id="edit-user-remarks"
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
                                    loading ||
                                    Boolean(
                                        queryError
                                    )
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