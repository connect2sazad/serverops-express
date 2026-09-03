import { apiClient } from './client';

export async function processes_list({
    page = 1,
    page_size = 10,
}) {
    const response = await apiClient.get('/processes', {
        params: {
            page,
            page_size
        }
    });

    return response.data;
}
