import { apiClient } from './client';

export async function inventory_list({
    page = 1,
    page_size = 10,
}) {
    const response = await apiClient.get('/inventories', {
        params: {
            page,
            page_size
        }
    });

    return response.data;
}

export async function inventory_read(id) {

    const response = await apiClient.get(
        `/inventories/${id}/`
    );

    return response.data.data;
}

export async function inventory_set_status(id, enabled) {

    const action = enabled ? 'enable' : 'disable';

    const response = await apiClient.put(
        `/inventories/${id}/${action}`
    );

    return response.data;
}

export async function inventory_create(data) {

    const payload = {
        ...data,
        operating_system: data.operating_system || undefined,
        description: data.description || undefined,
    };

    const response = await apiClient.post(
        '/inventories/',
        payload
    );

    return response.data.data;
}

export async function inventory_update(id, data) {

    const payload = {
        ...data,
        operating_system: data.operating_system?.trim() || null,
        description: data.description?.trim() || null,
        remarks: data.remarks?.trim() || null,
        tags: Array.isArray(data.tags) ? data.tags : [],
    };

    const response = await apiClient.put(
        `/inventories/${id}`,
        payload
    );

    return response.data.data;
}

export async function inventory_delete(id, data) {

    const payload = {
        ...data,
        operating_system: data.operating_system?.trim() || null,
        description: data.description?.trim() || null,
        remarks: data.remarks?.trim() || null,
        tags: Array.isArray(data.tags) ? data.tags : [],
    };

    const response = await apiClient.delete(
        `/inventories/${id}`,
        payload
    );

    return response.data.data;
}
