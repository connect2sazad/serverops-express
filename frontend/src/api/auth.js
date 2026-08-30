import { apiClient } from './client';

export async function loginRequest(username, password) {
    const response = await apiClient.post(
        "/auth/login", {
            username, password
        }
    );
    return response.data;
}

export async function currentUserRequest() {
    const response = await apiClient.get("users/self");
    return response.data;
}

export async function logoutRequerst() {
    const response = await apiClient.post("/auth/logout");
    return response.data;
}