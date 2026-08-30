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

export default function AuthProvider({ children }) {

    // const to store user & initialization
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(false);

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
    });

    const login = useCallback(

        async (username, password) => {

            // get token details by makeing a login request
            const tokenData = await loginRequest(username, password);
            // set access token received from tokenData
            setAccessToken(tokenData.access_token);

            try {

                // get current user and set it & return
                const currentUser = await currentUserRequest();
                setUser(currentUser);

                return currentUser;

            } catch (e) {
                clearAccessToken();
                setUser(null);
                throw error;
            }

        }, []

    );

    const logout = useCallback(
        async () => {
            try{
                // if there is a access token, process the logout request
                if(getAccessToken()){
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
                user && roles.includes(user.role)
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
        }), [
            user,
            initializing,
            login,
            logout,
            hasRole,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}