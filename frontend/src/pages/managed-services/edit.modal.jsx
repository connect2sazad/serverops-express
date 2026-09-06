import {
  useEffect,
  useMemo,
} from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { useQuery } from "@tanstack/react-query";
import Select from "react-select";

import TagsInput from "../../components/tags-input";
import { service_list } from "../../api/services";
import {
  managed_service_read,
} from "../../api/managed-services";

import { getApiError } from "../../api/api-error";

const ACTIONS = [
  { name: "can_start", label: "Start" },
  { name: "can_stop", label: "Stop" },
  { name: "can_restart", label: "Restart" },
  { name: "can_enable", label: "Enable" },
  { name: "can_disable", label: "Disable" },
];

const defaultValues = {
  service_name: "",
  can_start: false,
  can_stop: false,
  can_restart: false,
  can_enable: false,
  can_disable: false,
  remarks: "",
  tags: [],
};

export default function EditModal({
  open,
  inventoryId,
  managedServiceId,
  submitting,
  error,
  onClose,
  onSubmit,
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const {
    data: managedService,
    isPending: recordPending,
    isError: recordIsError,
    error: recordError,
  } = useQuery({
    queryKey: [
      "managed_service",
      inventoryId,
      managedServiceId,
    ],

    queryFn: () =>
      managed_service_read(
        inventoryId,
        managedServiceId
      ),

    enabled:
      open &&
      Boolean(inventoryId) &&
      Boolean(managedServiceId),

    retry: false,
    staleTime: 0,
  });

  const {
    data: servicesResponse,
    isPending: servicesPending,
    isError: servicesIsError,
    error: servicesError,
  } = useQuery({
    queryKey: [
      "inventory_services",
      inventoryId,
    ],

    queryFn: () =>
      service_list(inventoryId),

    enabled:
      open &&
      Boolean(inventoryId),

    retry: false,
    staleTime: 0,
  });

  const serviceOptions = useMemo(() => {
    const services =
      servicesResponse?.data?.services ?? [];

    const options = services.map(service => ({
      value: service.name,
      label: service.name,
      description: service.description,
    }));

    if (
      managedService?.service_name &&
      !options.some(
        option =>
          option.value ===
          managedService.service_name
      )
    ) {
      options.unshift({
        value: managedService.service_name,
        label: managedService.service_name,
        description:
          "Currently configured service",
      });
    }

    return options;
  }, [
    servicesResponse,
    managedService?.service_name,
  ]);

  useEffect(() => {
    if (!open || !managedService) return;

    reset({
      service_name:
        managedService.service_name ?? "",

      can_start:
        Boolean(managedService.can_start),

      can_stop:
        Boolean(managedService.can_stop),

      can_restart:
        Boolean(managedService.can_restart),

      can_enable:
        Boolean(managedService.can_enable),

      can_disable:
        Boolean(managedService.can_disable),

      remarks:
        managedService.remarks ?? "",

      tags:
        Array.isArray(managedService.tags)
          ? managedService.tags
          : [],
    });
  }, [open, managedService, reset]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = event => {
      if (
        event.key === "Escape" &&
        !submitting
      ) {
        onClose();
      }
    };

    document.body.classList.add("modal-open");

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.classList.remove(
        "modal-open"
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, submitting, onClose]);

  if (!open) return null;

  const loading =
    recordPending ||
    servicesPending;

  const submitForm = values => {
    const hasAllowedAction = ACTIONS.some(
      action => values[action.name]
    );

    if (!hasAllowedAction) {
      setError("actions", {
        type: "validate",
        message:
          "At least one service action must remain allowed.",
      });

      return;
    }

    onSubmit(values);
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="managed-service-edit-title"
      onMouseDown={event => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h2
              id="managed-service-edit-title"
              className="modal-title fs-5"
            >
              Edit Managed Service
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
            onSubmit={handleSubmit(submitForm)}
          >
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger">
                  {getApiError(error).message}
                </div>
              )}

              {recordIsError && (
                <div className="alert alert-danger">
                  {getApiError(recordError).message}
                </div>
              )}

              {servicesIsError && (
                <div className="alert alert-danger">
                  {getApiError(servicesError).message}
                </div>
              )}

              {loading && (
                <div className="text-center py-4">
                  <div
                    className="spinner-border"
                    role="status"
                  />

                  <p className="mt-2 mb-0">
                    Loading managed service…
                  </p>
                </div>
              )}

              {!loading &&
                !recordIsError &&
                !servicesIsError && (
                  <>
                    <div className="mb-3">
                      <label
                        className="form-label"
                        htmlFor="edit-managed-service-name"
                      >
                        Service
                      </label>

                      <Controller
                        name="service_name"
                        control={control}
                        rules={{
                          required:
                            "Service is required.",
                        }}
                        render={({ field }) => (
                          <Select
                            inputId="edit-managed-service-name"
                            options={serviceOptions}
                            isSearchable
                            isDisabled={submitting}
                            value={
                              serviceOptions.find(
                                option =>
                                  option.value ===
                                  field.value
                              ) ?? null
                            }
                            onChange={option =>
                              field.onChange(
                                option?.value ?? ""
                              )
                            }
                            onBlur={field.onBlur}
                            formatOptionLabel={option => (
                              <div>
                                <div>{option.label}</div>

                                {option.description && (
                                  <small className="text-secondary">
                                    {option.description}
                                  </small>
                                )}
                              </div>
                            )}
                          />
                        )}
                      />

                      {errors.service_name && (
                        <div className="text-danger small mt-1">
                          {errors.service_name.message}
                        </div>
                      )}
                    </div>

                    <fieldset className="mb-3">
                      <legend className="fs-6">
                        Allowed Actions
                      </legend>

                      <div className="row">
                        {ACTIONS.map(action => (
                          <div
                            key={action.name}
                            className="col-sm-6 col-lg-4 mb-2"
                          >
                            <div className="form-check">
                              <input
                                id={`edit-${action.name}`}
                                type="checkbox"
                                className="form-check-input"
                                disabled={submitting}
                                {...register(action.name)}
                              />

                              <label
                                className="form-check-label"
                                htmlFor={`edit-${action.name}`}
                              >
                                {action.label}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      {errors.actions && (
                        <div className="text-danger small">
                          {errors.actions.message}
                        </div>
                      )}
                    </fieldset>

                    <div className="mb-3">
                      <label
                        className="form-label"
                        htmlFor="edit-managed-service-remarks"
                      >
                        Remarks
                      </label>

                      <textarea
                        id="edit-managed-service-remarks"
                        className="form-control"
                        rows="3"
                        maxLength="1000"
                        disabled={submitting}
                        {...register("remarks")}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Tags
                      </label>

                      <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                          <TagsInput
                            value={
                              Array.isArray(field.value)
                                ? field.value
                                : []
                            }
                            onChange={field.onChange}
                            disabled={submitting}
                            maxTags={20}
                            error={
                              errors.tags?.message
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
                  recordIsError ||
                  servicesIsError
                }
              >
                {submitting
                  ? "Updating…"
                  : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}