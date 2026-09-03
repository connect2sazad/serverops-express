import { apiClient } from './client';

export async function users_list({
    page = 1,
    page_size = 10,
}) {
    const response = await apiClient.get('/users', {
        params: {
            page,
            page_size
        }
    });

    return response.data;
}
