const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_PREFIX = import.meta.env.VITE_API_PREFIX;
const API_FULL_URL = BACKEND_URL + API_PREFIX;
const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
const SESSION_EXPIRED_EVENT = import.meta.env.VITE_SESSION_EXPIRED_EVENT;

if (!BACKEND_URL || !API_PREFIX) {
  throw new Error(
    "Frontend API configuration is missing."
  );
}

export {
    BACKEND_URL,
    API_PREFIX,
    API_FULL_URL,
    ACCESS_TOKEN_KEY,
    SESSION_EXPIRED_EVENT
};