import { SESSION_EXPIRED_EVENT } from "../config/config";

export function notifySessionExpired() {
    window.dispatchEvent(
        new Event(SESSION_EXPIRED_EVENT)
    );
}

export function onSessionExpired(callback){
    window.addEventListener(
        SESSION_EXPIRED_EVENT,
        callback
    );

    return () => {
        window.removeEventListener(
            SESSION_EXPIRED_EVENT,
            callback
        );
    };
}