import { apiClient } from './client';

export async function loginRequest(userid, password) {
    const response = await apiClient.post(
        "/auth/login", {
            userid, password
        }
    );
    return response.data;
}

export async function currentUserRequest() {
    const response = await apiClient.get("/users/self");
    return response.data.data;
}

export async function logoutRequest() {
    const response = await apiClient.post("/auth/logout");
    return response.data;
}