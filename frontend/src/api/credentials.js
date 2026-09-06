import { apiClient } from './client';

const ROUTE = '/credentials';

export async function credential_list({
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

export async function credential_read(id) {

    const response = await apiClient.get(
        `${ROUTE}/${id}/`
    );

    return response.data.data;
}

export async function credential_set_status(id, enabled) {

    const action = enabled ? 'enable' : 'disable';

    const response = await apiClient.put(
        `${ROUTE}/${id}/${action}`
    );

    return response.data;
}

export async function credential_create(data) {

    const formData = new FormData();

    formData.append('inventory_id', String(data.inventory_id));
    formData.append('username', data.username.trim());
    formData.append('type', data.type);

    if (data.type === 'password')
        formData.append('secret', data.secret);


    if (data.type === 'private-key' && data.private_key instanceof File)
        formData.append('private_key', data.private_key);


    if (data.passphrase?.trim())
        formData.append('passphrase', data.passphrase);


    if (data.remarks?.trim())
        formData.append('remarks', data.remarks.trim())


    formData.append('tags',
        JSON.stringify(Array.isArray(data.tags) ? data.tags : [])
    );

    const response = await apiClient.post(
        ROUTE,
        formData
    );

    return response.data.data;
}

export async function credential_update(id, data) {

    const formData = new FormData();

    if (data.inventory_id !== undefined)
        formData.append('inventory_id', String(data.inventory_id));


    if (data.username?.trim())
        formData.append('username', data.username.trim());

    if (data.type)
        formData.append('type', data.type);

    if (data.type === 'password' && data.secret?.trim())
        formData.append('secret', data.secret);


    if (data.type === 'private-key' && data.private_key instanceof File)
        formData.append('private_key', data.private_key);

    if (data.passphrase !== undefined)
        formData.append('passphrase', data.passphrase?.trim() || '');

    formData.append('remarks', data.remarks.trim() || '')

    formData.append('tags',
        JSON.stringify(Array.isArray(data.tags) ? data.tags : [])
    );

    const response = await apiClient.put(
        `${ROUTE}/${id}/`,
        formData
    );

    return response.data.data;
}

export async function credential_delete(id) {

    const response = await apiClient.delete(
        `${ROUTE}/${id}/`
    );

    return response.data;
}