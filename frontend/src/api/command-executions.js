import { apiClient } from './client';

export async function command_executions_list({
    page = 1,
    page_size = 10,
}) {
    const response = await apiClient.get('/command-executions', {
        params: {
            page,
            page_size
        }
    });

    return response.data;
}
