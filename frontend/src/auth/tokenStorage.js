import { ACCESS_TOKEN_KEY } from "../config/config";

export function getAccessToken() {
    return sessionStorage.getItem(
        ACCESS_TOKEN_KEY
    );
}

export function clearAccessToken() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(
        'expires_in'
    );
}

export function setAccessToken(token) {
    sessionStorage.setItem(
        ACCESS_TOKEN_KEY,
        token.token
    );
    sessionStorage.setItem(
        'expires_in',
        token.expires_in
    );
}