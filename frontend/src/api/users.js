import {
    apiClient,
} from './client';


const USERS_ROUTE =
    '/users';

const REGISTER_ROUTE =
    '/auth/register';


export async function user_list({
    page = 1,
    page_size = 10,
    search = '',
}) {
    const response =
        await apiClient.get(
            USERS_ROUTE,
            {
                params: {
                    page,
                    page_size,

                    search:
                        search.trim() ||
                        undefined,
                },
            }
        );

    return response.data;
}


export async function user_read(id) {
    const response =
        await apiClient.get(
            `${USERS_ROUTE}/${id}`
        );

    return response.data.data;
}


export async function user_create(data) {
    const payload = {
        name:
            data.name.trim(),

        email:
            data.email
                .trim()
                .toLowerCase(),

        userid:
            data.userid.trim(),

        password:
            data.password,

        confirm_password:
            data.confirm_password,

        user_role_id:
            Number(
                data.user_role_id
            ),
    };

    const response =
        await apiClient.post(
            REGISTER_ROUTE,
            payload
        );

    return response.data;
}


export async function user_update(
    id,
    data
) {
    const payload = {};

    if (
        data.name !== undefined
    ) {
        payload.name =
            data.name.trim();
    }

    if (
        data.email !== undefined
    ) {
        payload.email =
            data.email
                .trim()
                .toLowerCase();
    }

    if (
        data.userid !== undefined
    ) {
        payload.userid =
            data.userid.trim();
    }

    if (
        data.user_role_id !==
        undefined
    ) {
        payload.user_role_id =
            Number(
                data.user_role_id
            );
    }

    if (
        data.remarks !== undefined
    ) {
        payload.remarks =
            data.remarks?.trim() ||
            null;
    }

    if (
        data.tags !== undefined
    ) {
        payload.tags =
            Array.isArray(data.tags)
                ? data.tags
                : [];
    }

    const response =
        await apiClient.put(
            `${USERS_ROUTE}/${id}`,
            payload
        );

    return response.data;
}


export async function user_update_permissions(
    id,
    individualPermissions
) {
    const response =
        await apiClient.put(
            `${USERS_ROUTE}/${id}/permissions`,
            {
                individual_permissions:
                    Array.isArray(
                        individualPermissions
                    )
                        ? individualPermissions
                        : [],
            }
        );

    return response.data;
}


export async function user_set_status(
    id,
    enabled
) {
    const action =
        enabled
            ? 'enable'
            : 'disable';

    const response =
        await apiClient.put(
            `${USERS_ROUTE}/${id}/${action}`
        );

    return response.data;
}


export async function user_delete(id) {
    const response =
        await apiClient.delete(
            `${USERS_ROUTE}/${id}`
        );

    return response.data;
}