'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'wholesale' | 'retail_guest';
    approval_status?: 'pending' | 'approved' | 'rejected';
    company_name?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    accessToken: null,
    login: async () => { },
    logout: async () => { },
    refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Try to get a new access token using the HttpOnly cookie
                // If it fails (401), it just means user is not logged in (Guest).
                const token = await refreshAuthToken();
                if (token) {
                    setAccessToken(token);
                    await fetchUser(token);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                // Determine if we need to clear state
                setUser(null);
                setAccessToken(null);
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    // Periodic Refresh (14 mins)
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(async () => {
            try {
                const token = await refreshAuthToken();
                if (token) setAccessToken(token);
            } catch (e) {
                // If refresh fails eventually (e.g. cookie expired), logout
                logout();
            }
        }, 14 * 60 * 1000);

        return () => clearInterval(interval);
    }, [user]);

    const refreshAuthToken = async () => {
        try {
            // This endpoint might return 401 if not logged in, which is expected.
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' // Important for cookies
            });

            if (!res.ok) return null; // Expected for guests

            const data = await res.json();
            return data.accessToken;
        } catch (e) {
            return null;
        }
    };

    const fetchUser = async (token: string) => {
        try {
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                // Token might be invalid or expired
                setUser(null);
                setAccessToken(null);
            }
        } catch (error) {
            console.error('Fetch user error', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setError(null);
        try {
            const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.msg || errorData.message || 'Login failed');
                // Throw to let caller know it failed (optional, but good for local UI loading states)
                throw new Error(errorData.msg || 'Login failed');
            }

            const data = await response.json();

            // Validate response structure
            if (!data.user) {
                setError('No user data received from server');
                return;
            }

            const token = data.accessToken || data.token;
            setAccessToken(token);
            setUser(data.user);

            // Redirect based on role
            if (data.user.role === 'admin') router.push('/admin');
            else if (data.user.role === 'wholesale') router.push('/catalogue');
            else router.push('/products');

        } catch (error: any) {
            setError(error.message || 'Login error');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.error('Logout failed', e);
        }
        setUser(null);
        setAccessToken(null);
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loading,
            error,
            accessToken,
            login,
            logout,
            refreshUser: async () => {
                const token = await refreshAuthToken();
                if (token) {
                    setAccessToken(token);
                    await fetchUser(token);
                }
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
