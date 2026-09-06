import { apiClient } from './client';

const ROUTE = inventoryId => `/inventories/${inventoryId}/services`;

export async function service_list({
    inventoryId,
    page = 1,
    page_size = 10,
    search = "",
}) {
    const response = await apiClient.get(ROUTE(inventoryId), {
        params: {
            page,
            page_size,
            search: search || undefined,
        }
    });

    return response.data;
}

export async function service_read(inventoryId, serviceName) {

    const response = await apiClient.get(
        `${ROUTE(inventoryId)}/${encodeURIComponent(serviceName)}/`
    );

    return response.data;
}

export async function service_action(inventoryId, serviceName, action, reason = null) {

    const payload = {
        reason: reason?.trim() || undefined,
    };

    const response = await apiClient.post(
        `${ROUTE(inventoryId)}/${encodeURIComponent(serviceName)}/${action}`, payload
    );

    return response.data;
}
