"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface User {
    nombre: string;
    email: string;
    puntos: number;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Inicia como true

    const fetchUser = async (authToken: string) => {
        try {
            const response = await fetch('http://localhost:8080/api/usuarios/me', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                logout();
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario", error);
            logout();
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('jwt_token');
            if (storedToken) {
                setToken(storedToken);
                await fetchUser(storedToken); // Esperamos a que termine el fetch
            }
            setIsLoading(false); // Ponemos loading en false DESPUÉS de intentar cargar todo
        };
        initializeAuth();
    }, []);

    const login = async (newToken: string) => {
        setIsLoading(true);
        setToken(newToken);
        localStorage.setItem('jwt_token', newToken);
        await fetchUser(newToken);
        setIsLoading(false);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
    };
    
    const refetchUser = () => {
        if(token) fetchUser(token);
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, isLoading, refetchUser }}>
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