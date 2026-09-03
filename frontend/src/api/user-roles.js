import { apiClient } from './client';

export async function user_roles_list({
    page = 1,
    page_size = 10,
}) {
    const response = await apiClient.get('/user-roles', {
        params: {
            page,
            page_size
        }
    });

    return response.data;
}
