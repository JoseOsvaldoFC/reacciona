"use client"

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { set } from "react-hook-form";

export default function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validación simple del lado del cliente
        if (!nombre || !email || !password){
            setError('Todos los campos son obligatorios.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/register',{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    email,
                    password,
                    puntos: 0 // valor inicial para un nuevo estudiante
                }),
            });

            if (!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al registrar el usuario.');
            }

            setSuccess('¡Registro existoso! Ahora puedes iniciar sesión.');
            // Opcionalmente, redirigir al login después de unos segundos
            // setTimeout(() => { window.location.href = '/login'; }, 2000);
        } catch (err: any){
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                    <CardDescription>
                        Ingresa tus datos para registrarte en Reacciona.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input id="nombre" type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {success && <p className="text-green-500 text-sm">{success}</p>}
                        
                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                            Crear mi cuenta
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        ¿Ya tienes una cuenta?{' '}
                        <Link href="/login" className="underline text-teal-600">
                            Iniciar sesión
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}