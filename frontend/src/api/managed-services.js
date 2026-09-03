import { apiClient } from './client';

export async function managed_services_list({
    page = 1,
    page_size = 10,
}) {
    const response = await apiClient.get('/managed-services', {
        params: {
            page,
            page_size
        }
    });

    return response.data;
}
