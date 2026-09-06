import { apiClient } from './client';


const ROUTE = '/user-roles';


function normalizePayload(data) {
    return {
        name: data.name.trim(),

        slug: data.slug
            .trim()
            .toLowerCase(),

        permissions: Array.isArray(data.permissions)
            ? data.permissions
            : [],

        remarks:
            data.remarks?.trim() || null,

        tags: Array.isArray(data.tags)
            ? data.tags
            : [],
    };
}


export async function user_role_list({
    page = 1,
    page_size = 10,
    search = '',
}) {
    const response = await apiClient.get(
        ROUTE,
        {
            params: {
                page,
                page_size,
                search:
                    search.trim() || undefined,
            },
        }
    );

    return response.data;
}


export async function user_role_read(id) {
    const response = await apiClient.get(
        `${ROUTE}/${id}`
    );

    return response.data.data;
}


export async function user_role_create(data) {
    const response = await apiClient.post(
        ROUTE,
        normalizePayload(data)
    );

    return response.data;
}


export async function user_role_update(
    id,
    data
) {
    const payload = {};

    if (data.name !== undefined) {
        payload.name = data.name.trim();
    }

    if (data.slug !== undefined) {
        payload.slug = data.slug
            .trim()
            .toLowerCase();
    }

    if (data.permissions !== undefined) {
        payload.permissions =
            Array.isArray(data.permissions)
                ? data.permissions
                : [];
    }

    if (data.remarks !== undefined) {
        payload.remarks =
            data.remarks?.trim() || null;
    }

    if (data.tags !== undefined) {
        payload.tags =
            Array.isArray(data.tags)
                ? data.tags
                : [];
    }

    const response = await apiClient.put(
        `${ROUTE}/${id}`,
        payload
    );

    return response.data;
}


export async function user_role_delete(id) {
    const response = await apiClient.delete(
        `${ROUTE}/${id}`
    );

    return response.data;
}


export async function user_role_set_status(
    id,
    enabled
) {
    const action = enabled
        ? 'enable'
        : 'disable';

    const response = await apiClient.put(
        `${ROUTE}/${id}/${action}`
    );

    return response.data;
}