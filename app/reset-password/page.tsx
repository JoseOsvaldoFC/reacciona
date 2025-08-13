"use client"
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('Token no encontrado. Por favor, solicita un nuevo enlace.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'No se pudo restablecer la contraseña.');
            }

            setMessage('¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión.');
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (!token && !error) return <div>Verificando token...</div>;

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Nueva Contraseña</CardTitle>
                <CardDescription>Ingresa tu nueva contraseña.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Nueva Contraseña</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    {message && <p className="text-sm text-green-600">{message}</p>}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={!token}>Cambiar Contraseña</Button>
                </form>
            </CardContent>
        </Card>
    );
}

// Envolvemos el componente en Suspense porque useSearchParams lo requiere.
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <ResetPasswordForm />
            </div>
        </Suspense>
    );
}