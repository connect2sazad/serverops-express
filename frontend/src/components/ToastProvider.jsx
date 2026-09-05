import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import ToastContext from "./ToastContext";

const VARIANT_CLASSES = {
    success: "text-bg-success",
    error: "text-bg-danger",
    warning: "text-bg-warning",
    info: "text-bg-primary",
};

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextIdRef = useRef(1);
    const timersRef = useRef(new Map());

    const removeToast = useCallback(id => {
        setToasts(current =>
            current.filter(toast => toast.id !== id)
        );

        const timer = timersRef.current.get(id);

        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const showToast = useCallback(({
        message,
        title = "",
        variant = "info",
        duration = 4000,
    }) => {
        const id = nextIdRef.current++;

        setToasts(current => [
            ...current,
            {
                id,
                title,
                message,
                variant,
            },
        ]);

        if (duration > 0) {
            const timer = setTimeout(() => {
                removeToast(id);
            }, duration);

            timersRef.current.set(id, timer);
        }

        return id;
    }, [removeToast]);

    useEffect(() => {
        const timers = timersRef.current;

        return () => {
            timers.forEach(timer => clearTimeout(timer));
            timers.clear();
        };
    }, []);

    const contextValue = useMemo(() => ({
        showToast,

        success(message, options = {}) {
            return showToast({
                ...options,
                message,
                variant: "success",
            });
        },

        error(message, options = {}) {
            return showToast({
                ...options,
                message,
                variant: "error",
            });
        },

        warning(message, options = {}) {
            return showToast({
                ...options,
                message,
                variant: "warning",
            });
        },

        info(message, options = {}) {
            return showToast({
                ...options,
                message,
                variant: "info",
            });
        },

        removeToast,
    }), [showToast, removeToast]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}

            <div
                className="toast-container position-fixed top-0 end-0 p-3"
                style={{ zIndex: 2000 }}
                aria-live="polite"
                aria-atomic="false"
            >
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast show border-0 ${
                            VARIANT_CLASSES[toast.variant] ||
                            VARIANT_CLASSES.info
                        }`}
                        role={
                            toast.variant === "error"
                                ? "alert"
                                : "status"
                        }
                    >
                        <div className="d-flex">
                            <div className="toast-body">
                                {toast.title && (
                                    <div className="fw-bold mb-1">
                                        {toast.title}
                                    </div>
                                )}

                                {toast.message}
                            </div>

                            <button
                                type="button"
                                className="btn-close btn-close-white me-2 m-auto"
                                aria-label="Close notification"
                                onClick={() => removeToast(toast.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}