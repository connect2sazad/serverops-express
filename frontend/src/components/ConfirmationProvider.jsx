import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import ConfirmationContext from "./ConfirmationContext";

const DEFAULT_OPTIONS = {
    title: "Confirm action",
    message: "Are you sure you want to continue?",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    variant: "danger",
    input: null,
};

export default function ConfirmationProvider({ children }) {
    const [options, setOptions] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [inputError, setInputError] = useState("");

    const resolverRef = useRef(null);
    const cancelButtonRef = useRef(null);
    const inputRef = useRef(null);

    const finishConfirmation = useCallback((confirmed, value = "") => {
        const resolver = resolverRef.current;

        resolverRef.current = null;
        setOptions(null);
        setInputValue("");
        setInputError("");

        resolver?.({
            confirmed,
            inputValue: value,
        });
    }, []);

    const cancelConfirmation = useCallback(() => {
        finishConfirmation(false);
    }, [finishConfirmation]);

    const submitConfirmation = useCallback(() => {
        const normalizedValue = inputValue.trim();
        const inputOptions = options?.input;

        if (inputOptions) {
            if (inputOptions.required && !normalizedValue) {
                setInputError(
                    inputOptions.requiredMessage ||
                    `${inputOptions.label || "This field"} is required.`
                );
                return;
            }

            if (
                normalizedValue &&
                inputOptions.minLength &&
                normalizedValue.length < inputOptions.minLength
            ) {
                setInputError(
                    inputOptions.minLengthMessage ||
                    `${inputOptions.label || "This field"} must contain at least ${inputOptions.minLength} characters.`
                );
                return;
            }

            if (
                normalizedValue &&
                inputOptions.maxLength &&
                normalizedValue.length > inputOptions.maxLength
            ) {
                setInputError(
                    inputOptions.maxLengthMessage ||
                    `${inputOptions.label || "This field"} cannot exceed ${inputOptions.maxLength} characters.`
                );
                return;
            }
        }

        finishConfirmation(true, normalizedValue);
    }, [inputValue, options, finishConfirmation]);

    const confirm = useCallback(customOptions => {
        // Cancel an older confirmation if a new one opens.
        resolverRef.current?.({
            confirmed: false,
            inputValue: "",
        });

        const mergedOptions = {
            ...DEFAULT_OPTIONS,
            ...customOptions,
        };

        setOptions(mergedOptions);
        setInputValue(mergedOptions.input?.defaultValue ?? "");
        setInputError("");

        return new Promise(resolve => {
            resolverRef.current = resolve;
        });
    }, []);

    useEffect(() => {
        if (!options) return undefined;

        const handleKeyDown = event => {
            if (event.key === "Escape") {
                cancelConfirmation();
            }
        };

        document.body.classList.add("modal-open");
        window.addEventListener("keydown", handleKeyDown);

        requestAnimationFrame(() => {
            if (options.input) {
                inputRef.current?.focus();
            } else {
                cancelButtonRef.current?.focus();
            }
        });

        return () => {
            document.body.classList.remove("modal-open");
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [options, cancelConfirmation]);

    useEffect(() => {
        return () => {
            resolverRef.current?.({
                confirmed: false,
                inputValue: "",
            });
        };
    }, []);

    const contextValue = useMemo(
        () => ({
            confirm,
        }),
        [confirm]
    );

    return (
        <ConfirmationContext.Provider value={contextValue}>
            {children}

            {options && (
                <>
                    <div
                        className="modal d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="global-confirmation-title"
                        onMouseDown={event => {
                            if (event.target === event.currentTarget) {
                                cancelConfirmation();
                            }
                        }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow">
                                <div className="modal-header">
                                    <h2
                                        id="global-confirmation-title"
                                        className="modal-title fs-5"
                                    >
                                        {options.title}
                                    </h2>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={cancelConfirmation}
                                    />
                                </div>

                                <div className="modal-body">
                                    <div className={options.input ? "mb-3" : ""}>
                                        {options.message}
                                    </div>

                                    {options.input && (
                                        <div>
                                            <label
                                                htmlFor="confirmation-input"
                                                className="form-label"
                                            >
                                                {options.input.label || "Reason"}

                                                {!options.input.required && (
                                                    <span className="text-secondary ms-1">
                                                        (optional)
                                                    </span>
                                                )}
                                            </label>

                                            {options.input.type === "text" ? (
                                                <input
                                                    ref={inputRef}
                                                    id="confirmation-input"
                                                    type="text"
                                                    className={`form-control ${inputError
                                                            ? "is-invalid"
                                                            : ""
                                                        }`}
                                                    value={inputValue}
                                                    placeholder={
                                                        options.input.placeholder
                                                    }
                                                    maxLength={
                                                        options.input.maxLength
                                                    }
                                                    onChange={event => {
                                                        setInputValue(
                                                            event.target.value
                                                        );
                                                        setInputError("");
                                                    }}
                                                />
                                            ) : (
                                                <textarea
                                                    ref={inputRef}
                                                    id="confirmation-input"
                                                    className={`form-control ${inputError
                                                            ? "is-invalid"
                                                            : ""
                                                        }`}
                                                    rows={
                                                        options.input.rows ?? 3
                                                    }
                                                    value={inputValue}
                                                    placeholder={
                                                        options.input.placeholder
                                                    }
                                                    maxLength={
                                                        options.input.maxLength
                                                    }
                                                    onChange={event => {
                                                        setInputValue(
                                                            event.target.value
                                                        );
                                                        setInputError("");
                                                    }}
                                                />
                                            )}

                                            {inputError && (
                                                <div className="invalid-feedback">
                                                    {inputError}
                                                </div>
                                            )}

                                            {options.input.maxLength && (
                                                <div className="form-text text-end">
                                                    {inputValue.length}/
                                                    {options.input.maxLength}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button
                                        ref={cancelButtonRef}
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={cancelConfirmation}
                                    >
                                        {options.cancelLabel}
                                    </button>

                                    <button
                                        type="button"
                                        className={`btn btn-${options.variant}`}
                                        onClick={submitConfirmation}
                                    >
                                        {options.confirmLabel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop show"
                        aria-hidden="true"
                    />
                </>
            )}
        </ConfirmationContext.Provider>
    );
}