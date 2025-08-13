"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setMessage('Si tu email está registrado, recibirás un correo con instrucciones.');
        } catch (error) {
            setMessage('Ocurrió un error. Por favor, inténtalo de nuevo.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
                    <CardDescription>Ingresa tu email para recibir un enlace de recuperación.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        {message && <p className="text-sm text-center text-gray-600">{message}</p>}
                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Enviar Enlace</Button>
                    </form>
                     <div className="mt-4 text-center text-sm">
                        <Link href="/login" className="underline text-teal-600">
                           Volver a Iniciar Sesión
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}