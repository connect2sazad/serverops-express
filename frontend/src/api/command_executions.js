import { apiClient } from './client';

const ROUTE = '/command-executions';

export async function command_execution_list({
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

export async function command_execution_read(id) {

    const response = await apiClient.get(
        `${ROUTE}/${id}/`
    );

    return response.data.data;
}