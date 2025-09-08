"use client"
import { useState, useEffect, Suspense, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPending, startTransition] = useTransition(); // 2. Inicializamos la transición
    
    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            toast.error('Token no encontrado o inválido. Por favor, solicita un nuevo enlace.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return;
        }

        // 3. Envolvemos la lógica asíncrona en startTransition
        startTransition(async () => {
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

                // 4. Usamos toast para las notificaciones
                toast.success('¡Tu contraseña ha sido actualizada con éxito!');
                setPassword('');
                setConfirmPassword('');

            } catch (err: any) {
                toast.error(err.message);
            }
        });
    };

    if (!token) {
        return (
             <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">Error</CardTitle>
                    <CardDescription>El enlace de recuperación es inválido o ha expirado.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Link href="/forgot-password">
                        <Button variant="outline" className="w-full">Solicitar un nuevo enlace</Button>
                     </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Nueva Contraseña</CardTitle>
                <CardDescription>Ingresa tu nueva contraseña.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Nueva Contraseña</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isPending} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isPending} />
                    </div>
                    
                    {/* 5. Deshabilitamos el botón y cambiamos el texto durante la carga */}
                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isPending}>
                        {isPending ? "Actualizando..." : "Cambiar Contraseña"}
                    </Button>
                </form>
                {/* 6. Añadimos un link para volver al login */}
                <div className="mt-4 text-center text-sm">
                    <Link href="/login" className="underline text-teal-600">
                       Ir a Iniciar Sesión
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

// Envolvemos el componente en Suspense porque useSearchParams lo requiere.
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando...</div>}>
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <ResetPasswordForm />
            </div>
        </Suspense>
    );
}