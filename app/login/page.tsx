"use client"

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPending, startTransition] = useTransition();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (!response.ok) {
                    throw new Error('Email o contraseña incorrectos.');
                }

                const data = await response.json();
                await login(data.token);
                toast.success("¡Bienvenido de nuevo!");
                window.location.href = '/';
            } catch (err: any) {
                toast.error(err.message);
            }
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
                    <CardDescription>Ingresa tu email para acceder a tu cuenta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isPending}/>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Contraseña</Label>
                                <Link href="/forgot-password" className="ml-auto inline-block text-sm underline text-teal-600">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isPending}/>
                        </div>
                        
                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isPending}>
                            {isPending ? "Accediendo..." : "Acceder"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        ¿No tienes una cuenta?{' '}
                        <Link href="/register" className="underline text-teal-600">
                            Regístrate
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}