// ============================================================
// client/src/lib/api.ts — Axios API Client
// ============================================================
// Central HTTP client for all calls from React to the Express server.
// ============================================================

import axios from "axios";
import { getToken, clearToken } from "./auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
    headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Token attached", token)
        console.log("Config", config)
    }
    else {
        console.log("No token found")
    }
    return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearToken();
            window.location.href = "/login";
        }
        else {
            console.log("Error", error)
        }
        return Promise.reject(error);
    }
);

export default api;
