import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    currentUserRequest,
    loginRequest,
    logoutRequest,
} from '../api/auth';

import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from './tokenStorage';

import {
    onSessionExpired,
} from './authEvents';

import {
    AuthContext,
} from './AuthContext';

import AppException from
    '../exceptions/exception';

import HTTP_STATUS from
    '../exceptions/status_codes';


export default function AuthProvider({
    children,
}) {
    const [
        user,
        setUser,
    ] = useState(null);

    const [
        initializing,
        setInitializing,
    ] = useState(true);


    const refreshUser =
        useCallback(
            async () => {
                const token =
                    getAccessToken();

                if (!token) {
                    setUser(null);

                    return null;
                }

                const currentUser =
                    await currentUserRequest();

                setUser(
                    currentUser
                );

                return currentUser;
            },
            []
        );


    useEffect(() => {
        async function restoreSession() {
            const token =
                getAccessToken();

            if (!token) {
                setInitializing(false);

                return;
            }

            try {
                await refreshUser();
            } catch {
                clearAccessToken();

                setUser(null);
            } finally {
                setInitializing(false);
            }
        }

        restoreSession();
    }, [
        refreshUser,
    ]);


    useEffect(() => {
        return onSessionExpired(
            () => {
                clearAccessToken();

                setUser(null);
            }
        );
    }, []);


    const login =
        useCallback(
            async (
                userid,
                password
            ) => {
                const tokenData =
                    await loginRequest(
                        userid,
                        password
                    );

                if (!tokenData?.token) {
                    throw new AppException(
                        'No access token received from server.',
                        HTTP_STATUS.HTTP_401_UNAUTHORIZED
                    );
                }

                setAccessToken(
                    tokenData.token
                );

                try {
                    return await refreshUser();
                } catch (error) {
                    clearAccessToken();

                    setUser(null);

                    throw error;
                }
            },
            [
                refreshUser,
            ]
        );


    const logout =
        useCallback(
            async () => {
                try {
                    if (
                        getAccessToken()
                    ) {
                        await logoutRequest();
                    }
                } finally {
                    clearAccessToken();

                    setUser(null);
                }
            },
            []
        );


    const hasRole =
        useCallback(
            (...roles) => {
                return Boolean(
                    user &&
                    roles.includes(
                        user.role?.slug
                    )
                );
            },
            [
                user,
            ]
        );


    const hasPermission =
        useCallback(
            (
                ...requiredPermissions
            ) => {
                const permissions =
                    user?.permissions;

                if (
                    !Array.isArray(
                        permissions
                    ) ||
                    requiredPermissions.length ===
                        0
                ) {
                    return false;
                }

                return (
                    permissions.includes(
                        '*'
                    ) ||
                    requiredPermissions.every(
                        permission =>
                            permissions.includes(
                                permission
                            )
                    )
                );
            },
            [
                user,
            ]
        );


    const value =
        useMemo(
            () => ({
                user,

                initializing,

                isAuthenticated:
                    Boolean(user),

                login,

                logout,

                refreshUser,

                hasRole,

                hasPermission,
            }),
            [
                user,
                initializing,
                login,
                logout,
                refreshUser,
                hasRole,
                hasPermission,
            ]
        );


    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}