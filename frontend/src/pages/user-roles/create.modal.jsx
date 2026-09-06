import {
    useEffect,
} from 'react';

import {
    Controller,
    useForm,
} from 'react-hook-form';

import {
    getApiError,
} from '../../api/api-error';

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


function createSlug(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}


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
        setValue,
        watch,
        formState: {
            errors,
        },
    } = useForm({
        defaultValues,
    });

    const roleName = watch('name');
    const roleSlug = watch('slug');

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

    const handleNameBlur = () => {
        if (!roleSlug?.trim()) {
            setValue(
                'slug',
                createSlug(roleName || ''),
                {
                    shouldValidate: true,
                    shouldDirty: true,
                }
            );
        }
    };

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-role-title"
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
                            id="create-user-role-title"
                            className="modal-title fs-5"
                        >
                            Add User Role
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

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label
                                        className="form-label"
                                        htmlFor="create-role-name"
                                    >
                                        Role Name
                                    </label>

                                    <input
                                        id="create-role-name"
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

                                                onBlur:
                                                    handleNameBlur,
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
                                        htmlFor="create-role-slug"
                                    >
                                        Role Slug
                                    </label>

                                    <input
                                        id="create-role-slug"
                                        type="text"
                                        autoComplete="off"
                                        disabled={
                                            submitting
                                        }
                                        placeholder="server-operator"
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
                                        The slug is generated
                                        from the role name if
                                        left empty before
                                        leaving the name field.
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
                                    htmlFor="create-role-remarks"
                                >
                                    Remarks
                                </label>

                                <textarea
                                    id="create-role-remarks"
                                    rows="3"
                                    disabled={submitting}
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
                                disabled={submitting}
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