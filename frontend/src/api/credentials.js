import { apiClient } from './client';

const ROUTE = '/credentials';

export async function credential_list({
    page = 1,
    page_size = 10,
    search = "",
}) {
    const response = await apiClient.get(ROUTE, {
        params: {
            page,
            page_size,
            search: search || undefined,
        }
    });

    return response.data;
}

export async function credential_read(id) {

    const response = await apiClient.get(
        `${ROUTE}/${id}/`
    );

    return response.data.data;
}

export async function credential_set_status(id, enabled) {

    const action = enabled ? 'enable' : 'disable';

    const response = await apiClient.put(
        `${ROUTE}/${id}/${action}`
    );

    return response.data;
}

export async function credential_create(data) {

    const payload = {
        ...data,
        operating_system: data.operating_system || undefined,
        description: data.description || undefined,
    };

    const response = await apiClient.post(
        ROUTE,
        payload
    );

    return response.data.data;
}

export async function credential_update(id, data) {

    const payload = {
        ...data,
        operating_system: data.operating_system?.trim() || null,
        description: data.description?.trim() || null,
        remarks: data.remarks?.trim() || null,
        tags: Array.isArray(data.tags) ? data.tags : [],
    };

    const response = await apiClient.put(
        `${ROUTE}/${id}/`,
        payload
    );

    return response.data.data;
}

export async function credential_delete(id) {

    const response = await apiClient.delete(
        `${ROUTE}/${id}/`
    );

    return response.data.data;
}