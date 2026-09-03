import { apiClient } from './client';

export async function credentials_list({
    page = 1,
    page_size = 10,
}) {
    const response = await apiClient.get('/credentials', {
        params: {
            page,
            page_size
        }
    });

    return response.data;
}
