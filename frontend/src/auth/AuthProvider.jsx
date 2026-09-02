import {
    useCallback, useEffect, useMemo, useState
} from 'react';

import {
    currentUserRequest, loginRequest, logoutRequest
} from '../api/auth.js';

import {
    clearAccessToken, getAccessToken, setAccessToken
} from './tokenStorage';

import { onSessionExpired } from './authEvents';

import { AuthContext } from './AuthContext';
import AppException from '../exceptions/exception.js';
import HTTP_STATUS from '../exceptions/status_codes.js';

export default function AuthProvider({ children }) {

    // const to store user & initialization
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {

        // restoring session
        async function restoreSession() {

            // get stored token
            const token = getAccessToken();

            // if token is not available, set initialization to false
            if (!token) {
                setInitializing(false);
                return;
            }

            try {

                // get current user if the token is available and set the user
                const currentUser = await currentUserRequest();
                setUser(currentUser);

            } catch {
                // clear the access token and clear the user
                clearAccessToken();
                setUser(null);
            } finally {
                setInitializing(false);
            }

        }

        restoreSession();
    }, []);

    useEffect(() => {
        // when the session is expired, clear the access token
        return onSessionExpired(() => {
            clearAccessToken();
            setUser(null);
        });
    }, []);

    const login = useCallback(

        async (userid, password) => {

            // get token details by makeing a login request
            const tokenData = await loginRequest(userid, password);

            if (!tokenData) {
                throw new AppException("No access token received from server.", HTTP_STATUS.HTTP_401_UNAUTHORIZED);
            }
            
            // set access token received from tokenData
            setAccessToken(tokenData.token);

            try {

                // get current user and set it & return
                const currentUser = await currentUserRequest();
                setUser(currentUser);

                return currentUser;

            } catch (e) {
                clearAccessToken();
                setUser(null);
                throw e;
            }

        }, []

    );

    const logout = useCallback(
        async () => {
            try {
                // if there is a access token, process the logout request
                if (getAccessToken()) {
                    await logoutRequest();
                }

            } finally {
                clearAccessToken();
                setUser(null);
            }
        }, []
    );

    const hasRole = useCallback(
        (...roles) => {
            return Boolean(
                user && roles.includes(user.role?.slug)
            );
        }, [user]
    );

    const hasPermission = useCallback(
        (...required_permissions) => {
            const permissions = user?.permissions;

            if(
                !Array.isArray(permissions) || required_permissions.length === 0
            ) return false;

            return (
                permissions.includes('*')
                || required_permissions.every(permission => permissions.includes(permission))
            );
        }, [user]
    );

    const value = useMemo(
        () => ({
            user,
            initializing,
            isAuthenticated: Boolean(user),
            login,
            logout,
            hasRole,
            hasPermission
        }), [
        user,
        initializing,
        login,
        logout,
        hasRole,
        hasPermission
    ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}