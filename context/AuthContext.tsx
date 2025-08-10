"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        if (storedToken) {
            setToken(storedToken);
        }
        setLoading(false); 
    }, []);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('jwt_token', newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('jwt_token');
        window.location.href = '/login'; 
    };

    const isAuthenticated = !!token;

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};