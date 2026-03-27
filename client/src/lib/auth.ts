// ============================================================
// client/src/lib/auth.ts — Client-Side Auth Helpers
// ============================================================
// Manages JWT token storage and the current user's session state.
//
//   getToken() → reads JWT from localStorage
//   setToken(token) → saves JWT to localStorage
//   clearToken() → removes JWT from localStorage
//
//   decodeToken(token) → decodes JWT payload (without verifying)
//     returns { id, email, role } or null
//
//   isAuthenticated() → returns true if a valid (non-expired) token exists
//
// ============================================================

const TOKEN_KEY = "rm_token";

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
    const token = getToken();
    if (!token) {
        return false;
    }
    try {
        const decodedToken = decodeToken(token);
        if (!decodedToken) {
            return false
        }
        const isExpired = decodedToken.exp < Date.now() / 1000;
        if (isExpired) {
            clearToken();
            return false;
        }
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

export function decodeToken(token: string) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(atob(base64).split("").map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.log(error)
        return null;
    }
}
