
/**
 * Authentication Utility to prevent session cross-contamination between roles.
 * It uses role-specific keys in localStorage.
 */

export type UserRole = 'admin' | 'designer' | 'customer' | 'buyer';

const getStorageKey = (role: string) => {
    // Normalize buyer to customer
    const r = role === 'buyer' ? 'customer' : role;
    return `userInfo_${r}`;
};

const getTokenKey = (role: string) => {
    const r = role === 'buyer' ? 'customer' : role;
    return `token_${r}`;
};

/**
 * Detects the current role based on the URL path.
 */
export const detectRole = (): UserRole => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/designer') || 
        path.startsWith('/design-tool') || 
        path.startsWith('/submit-product') || 
        path.startsWith('/my-shop') || 
        path.startsWith('/my-designs') || 
        path.startsWith('/my-sales') || 
        path.startsWith('/requests')) return 'designer';
    return 'customer';
};

/**
 * Gets the user info for a specific role or the detected role.
 */
export const getUserInfo = (role?: string) => {
    const activeRole = role || detectRole();
    const key = getStorageKey(activeRole);
    const data = localStorage.getItem(key);
    
    // Fallback to legacy 'userInfo' if specific key not found (migration)
    if (!data) {
        const legacy = localStorage.getItem('userInfo');
        if (legacy) {
            const parsed = JSON.parse(legacy);
            if (parsed.role === activeRole || (parsed.role === 'buyer' && activeRole === 'customer')) {
                return parsed;
            }
        }
        return null;
    }
    
    return JSON.parse(data);
};

/**
 * Sets the user info for a specific role.
 */
export const setUserInfo = (data: any) => {
    if (!data || !data.role) return;
    const key = getStorageKey(data.role);
    localStorage.setItem(key, JSON.stringify(data));
    
    if (data.token) {
        localStorage.setItem(getTokenKey(data.role), data.token);
    }
    
    // Also update legacy for backward compatibility during transition
    localStorage.setItem('userInfo', JSON.stringify(data));
    if (data.token) localStorage.setItem('token', data.token);
};

/**
 * Gets the token for a specific role or the detected role.
 */
export const getToken = (role?: string) => {
    const activeRole = role || detectRole();
    const key = getTokenKey(activeRole);
    return localStorage.getItem(key) || localStorage.getItem('token');
};

/**
 * Clears the session for a specific role.
 */
export const clearAuth = (role?: string) => {
    const activeRole = role || detectRole();
    localStorage.removeItem(getStorageKey(activeRole));
    localStorage.removeItem(getTokenKey(activeRole));
    
    // If clearing the currently "active" legacy session
    const legacy = localStorage.getItem('userInfo');
    if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed.role === activeRole) {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
        }
    }
};
