import { ACCESS_TOKEN_KEY } from "../config/config";

export function getAccessToken() {
    return sessionStorage.getItem(
        ACCESS_TOKEN_KEY
    );
}

export function clearAccessToken() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
    sessionStorage.setItem(
        ACCESS_TOKEN_KEY,
        token
    )
}