import axios from 'axios';

import {
    clearAccessToken, getAccessToken
} from "../auth/tokenStorage";
import {
    notifySessionExpired
} from '../auth/authEvents';
import { API_FULL_URL } from '../config/config';

export const apiClient = axios.create({
    baseURL: API_FULL_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        if(token) {
            config.headers.Authorization = 
                `Bearer ${token}`;
        }

        return config;
    },

    e => Promise.reject(e)
);

apiClient.interceptors.request.use(
    response => response,
    e => {
        const status = e.response?.status;

        const requestUrl = e.config?.url || "";

        const isLoginRequest = requestUrl.endsWith("/auth/login");

        if(status === 401 && !isLoginRequest && getAccessToken()){
            clearAccessToken();
            notifySessionExpired();
        }

        return Promise.reject(e);
    }
);