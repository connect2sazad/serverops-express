import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { getApiError } from '../../api/api-error';
import TagsInput from '../../components/tags-input';

export default function CreateModal({
    open,
    submitting,
    error,
    onClose,
    onSubmit
}) {

    const form = useForm({
        defaultValues: {
            name: '',
            hostname: '',
            ssh_port: 22,
            environment: 'development',
            operating_system: '',
            description: '',
            tags: [],
            remarks: '',
        }
    });
    const { register, control, handleSubmit, reset, formState: { errors } } = form;

    useEffect(() => {
        if (!open) return;

        reset({
            name: '',
            hostname: '',
            ssh_port: 22,
            environment: 'development',
            operating_system: '',
            description: '',
            tags: [],
            remarks: '',
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

                        <form noValidate onSubmit={handleSubmit(onSubmit)}>
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
                                    <label className="form-label" htmlFor="name" >
                                        Credential Name
                                    </label>

                                    <input id="name" autoComplete="off" autoFocus placeholder="Credential Name"
                                        className={`form-control ${errors.name
                                            ? "is-invalid" : ""}`}
                                        {...register("name", {
                                            required: "Credential Name is required!",
                                            minLength: {
                                                value: 3,
                                                message: 'Credential name must contain at least 3 characters.',
                                            },
                                            maxLength: {
                                                value: 100,
                                                message: 'Credential name cannot exceed 100 characters.',
                                            },
                                        })}
                                    />

                                    <div className="invalid-feedback">
                                        {errors.name?.message}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="hostname" >
                                        Hostname
                                    </label>

                                    <input id="hostname" autoComplete="off" placeholder="Hostname or Public IP"
                                        className={`form-control ${errors.hostname
                                            ? "is-invalid" : ""}`}
                                        {...register("hostname", {
                                            required: 'Hostname is required.',
                                            maxLength: {
                                                value: 100,
                                                message: 'Hostname cannot exceed 100 characters.',
                                            },
                                        })}
                                    />

                                    <div className="invalid-feedback">
                                        {errors.hostname?.message}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="ssh-port" >
                                        Port
                                    </label>

                                    <input type="number" id="ssh-port" autoComplete="off" placeholder="SSH Port"
                                        className={`form-control ${errors.ssh_port
                                            ? "is-invalid" : ""}`}
                                        {...register("ssh_port", {
                                            valueAsNumber: true,
                                            required: 'SSH port is required.',
                                            min: {
                                                value: 1,
                                                message: 'SSH port must be at least 1.',
                                            },
                                            max: {
                                                value: 65535,
                                                message: 'SSH port cannot exceed 65535.',
                                            },
                                        })}
                                    />

                                    <div className="invalid-feedback">
                                        {errors.ssh_port?.message}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="env" >
                                        Environment
                                    </label>

                                    <select name="" id="env" className={`form-control ${errors.environment
                                        ? "is-invalid" : ""}`} {...register('environment', {required: "Environment is required."})}>
                                        <option value="production">Production</option>
                                        <option value="development">Development</option>
                                        <option value="test">Test</option>
                                    </select>

                                    <div className="invalid-feedback">
                                        {errors.environment?.message}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="operating_system" >
                                        Operating System
                                    </label>

                                    <select name="" id="operating_system" className={`form-control ${errors.operating_system
                                        ? "is-invalid" : ""}`} {...register('operating_system')}>
                                        <option value="">Not specified</option>
                                        <option value="Windows OS">Windows OS</option>
                                        <option value="Linux OS">Linux OS</option>
                                        <option value="Apple OS">Apple OS</option>
                                        <option value="Chrome OS">Chrome OS</option>
                                    </select>

                                    <div className="invalid-feedback">
                                        {errors.operating_system?.message}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="description" >
                                        Description
                                    </label>

                                    <textarea id="description" className={`form-control ${errors.description
                                        ? "is-invalid" : ""}`} placeholder="Description"
                                        {...register('description')}></textarea>

                                    <div className="invalid-feedback">
                                        {errors.description?.message}
                                    </div>
                                </div>

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
                                        render={({field}) => (
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