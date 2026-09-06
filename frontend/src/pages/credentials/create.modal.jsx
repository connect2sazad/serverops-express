import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import AsyncSelect from 'react-select/async';

import { getApiError } from '../../api/api-error';
import TagsInput from '../../components/tags-input';
import { inventory_list } from "../../api/inventories";

export default function CreateModal({
    open,
    submitting,
    error,
    onClose,
    onSubmit
}) {

    const form = useForm({
        defaultValues: {
            inventory: null,
            username: '',
            type: 'password',
            secret: '',
            private_key: null,
            passphrase: '',
            tags: [],
            remarks: '',
        }
    });
    const { register, control, handleSubmit, reset, watch, formState: { errors } } = form;

    const credentialType = watch('type');

    const loadInventoryOptions = async inputValue => {
        const response = await inventory_list({
            page: 1,
            page_size: 20,
            search: inputValue.trim(),
        });

        return response.data.map(inventory => {
            const memoryGiB =
                inventory.memory_total_kib != null
                    ? (
                        inventory.memory_total_kib /
                        1024 /
                        1024
                    ).toFixed(2)
                    : null;

            const tags = Array.isArray(inventory.tags)
                ? inventory.tags
                : [];

            const details = [
                inventory.operating_system,
                inventory.kernel
                    ? `Kernel ${inventory.kernel}`
                    : null,
                inventory.architecture,
                memoryGiB
                    ? `${memoryGiB} GiB RAM`
                    : null,
                inventory.environment,
            ].filter(Boolean);

            return {
                value: inventory.id,
                label: `${inventory.name} — ${inventory.hostname}:${inventory.ssh_port}`,
                description:
                    details.length > 0
                        ? details.join(" · ")
                        : "System information not discovered",
                tags,
                inventory,
            };
        });
    };

    useEffect(() => {
        if (!open) return;

        reset({
            inventory: null,
            username: "",
            type: "password",
            secret: "",
            private_key: null,
            passphrase: "",
            tags: [],
            remarks: "",
        });
    }, [open, reset]);

    // opening the modal
    useEffect(() => {

        if (!open) return undefined;

        const handleKeyDown = event => {
            if (event.key === 'Escape' && !submitting) onClose();
        }

        document.body.classList.add('modal-open');
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, submitting, onClose]);

    const submitForm = values => {
        onSubmit({
            ...values,
            inventory_id: values.inventory.value,
            private_key: values.private_key?.[0] ?? null,
            secret: values.type === 'password' ? values.secret : undefined,
            passphrase: values.type === 'private-key' ? values.passphrase : undefined,
        });
    }

    if (!open) return null;

    return (
        <>
            <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="create-credential-title" onMouseDown={event => {
                if (event.target === event.currentTarget && !submitting) {
                    onClose();
                }
            }}>

                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow">
                        <div className="modal-header">
                            <h2 id="create-credential-title" className="modal-title fs-5">Add New Credential</h2>
                            <button type="button" className="btn-close" aria-label="Close" disabled={submitting} onClick={onClose} />
                        </div>

                        <form noValidate onSubmit={handleSubmit(submitForm)}>
                            <div className="modal-body">
                                {error && (
                                    <div className="alert alert-danger">
                                        {
                                            getApiError(error).message
                                        }
                                    </div>
                                )}
                                {/* ==============================================FORM FIELDS=============================================== */}

                                <div className="mb-3">
                                    <label
                                        className="form-label"
                                        htmlFor="credential-inventory"
                                    >
                                        Attach Credential to Inventory
                                    </label>

                                    <Controller
                                        name="inventory"
                                        control={control}
                                        rules={{
                                            required: "Inventory selection is required.",
                                        }}
                                        render={({ field }) => (
                                            <AsyncSelect
                                                inputId="credential-inventory"
                                                cacheOptions
                                                defaultOptions
                                                isClearable
                                                isDisabled={submitting}
                                                value={field.value}
                                                loadOptions={loadInventoryOptions}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                placeholder="Search by name, hostname, OS..."
                                                getOptionLabel={option => option.label}
                                                getOptionValue={option => String(option.value)}
                                                formatOptionLabel={option => (
                                                    <div>
                                                        <div className="fw-semibold">
                                                            {option.label}
                                                        </div>

                                                        <div className="small text-secondary">
                                                            {option.description}
                                                        </div>

                                                        {option.tags.length > 0 && (
                                                            <div className="d-flex flex-wrap gap-1 mt-1">
                                                                {option.tags.map(tag => (
                                                                    <span
                                                                        key={tag}
                                                                        className="badge rounded-pill bg-secondary"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                noOptionsMessage={({ inputValue }) =>
                                                    inputValue
                                                        ? "No matching inventories found."
                                                        : "No inventories available."
                                                }
                                                loadingMessage={() =>
                                                    "Searching inventories..."
                                                }
                                                className={
                                                    errors.inventory
                                                        ? "is-invalid"
                                                        : ""
                                                }
                                                classNamePrefix="inventory-select"
                                            />
                                        )}
                                    />

                                    {errors.inventory && (
                                        <div className="invalid-feedback d-block">
                                            {errors.inventory.message}
                                        </div>
                                    )}

                                    <div className="form-text">
                                        Start typing to search all inventories.
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="username" >
                                        SSH Username
                                    </label>

                                    <input id="username" autoComplete="off" placeholder="SSH Username"
                                        className={`form-control ${errors.username
                                            ? "is-invalid" : ""}`}
                                        {...register("username", {
                                            required: 'Username is required.',
                                            maxLength: {
                                                value: 100,
                                                message: 'Hostname cannot exceed 100 characters.',
                                            },
                                        })}
                                    />

                                    <div className="invalid-feedback">
                                        {errors.username?.message}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="credential-type" >
                                        Credential Type
                                    </label>

                                    <select id="credential-type" className="form-select"
                                        {...register("type")}
                                    >
                                        <option value="password">Password</option>
                                        <option value="private-key">Private Key</option>
                                    </select>
                                </div>

                                {credentialType === "password" && (
                                    <div className="mb-3">
                                        <label
                                            className="form-label"
                                            htmlFor="credential-password"
                                        >
                                            Password
                                        </label>

                                        <input
                                            id="credential-password"
                                            type="password"
                                            autoComplete="new-password"
                                            className={`form-control ${errors.secret
                                                ? "is-invalid"
                                                : ""
                                                }`}
                                            {...register("secret", {
                                                validate: value =>
                                                    credentialType !==
                                                    "password" ||
                                                    Boolean(value) ||
                                                    "Password is required.",
                                            })}
                                        />

                                        <div className="invalid-feedback">
                                            {errors.secret?.message}
                                        </div>
                                    </div>
                                )}

                                {credentialType === "private-key" && (
                                    <>
                                        <div className="mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="credential-private-key"
                                            >
                                                Private Key
                                            </label>

                                            <input
                                                id="credential-private-key"
                                                type="file"
                                                className={`form-control ${errors.private_key
                                                    ? "is-invalid"
                                                    : ""
                                                    }`}
                                                {...register("private_key", {
                                                    validate: files =>
                                                        files?.length > 0 ||
                                                        "Private key file is required.",
                                                })}
                                            />

                                            <div className="invalid-feedback">
                                                {
                                                    errors.private_key
                                                        ?.message
                                                }
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="credential-passphrase"
                                            >
                                                Passphrase
                                                <span className="text-secondary ms-1">
                                                    (optional)
                                                </span>
                                            </label>

                                            <input
                                                id="credential-passphrase"
                                                type="password"
                                                autoComplete="new-password"
                                                className="form-control"
                                                {...register("passphrase")}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="remarks" >
                                        Remarks
                                    </label>

                                    <textarea id="remarks" className={`form-control ${errors.remarks
                                        ? "is-invalid" : ""}`} placeholder="Remarks"
                                        {...register('remarks')}></textarea>

                                    <div className="invalid-feedback">
                                        {errors.remarks?.message}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="tags" >
                                        Tags
                                    </label>

                                    <Controller name="tags" control={control} defaultValue={[]}
                                        rules={{
                                            validate: tags =>
                                                tags.length <= 20 ||
                                                'A maximum of 20 tags is allowed.',
                                        }}
                                        render={({ field }) => (
                                            <TagsInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={submitting}
                                                error={errors.tags?.message}
                                            />
                                        )}
                                    />

                                </div>

                                {/* ==============================================FORM FIELDS=============================================== */}
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
                                    {submitting ? 'Creating…' : 'Create'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

            </div>

            <div className="modal-backdrop show" aria-hidden="true"></div>
        </>
    );
}