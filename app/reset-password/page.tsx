"use client"
import { useState, useEffect, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter} from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            setError(null)
        } else {
            toast.error('Token no encontrado en el enlace.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return;
        }
        if (!token) {
            setError('Token no válido.');
            return;
        }

        startTransition(async () => {
            setError(null)
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
                const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
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
                setError(err.message);
                toast.error(err.message);
            }
        });
    };

if (error) {
        // Muestra mensaje de error y opción para solicitar nuevo enlace
        return (
             <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">Error</CardTitle>
                    <CardDescription>{error}</CardDescription> {/* Muestra el mensaje de error */}
                </CardHeader>
                <CardContent className="space-y-4">
                     <p className="text-sm text-center">Por favor, solicita un nuevo enlace de recuperación.</p>
                     <Link href="/forgot-password" className="w-full">
                        <Button variant="outline" className="w-full">
                            Solicitar nuevo enlace
                        </Button>
                     </Link>
                     <div className="text-center text-sm">
                        <Link href="/login" className="underline text-teal-600">
                           Ir a Iniciar Sesión
                        </Link>
                     </div>
                </CardContent>
            </Card>
        );
    }

    // Muestra el formulario si no hay error y el token existe (aunque sea inválido, el submit lo verificará)
    if (!token && !error) {
        // Estado intermedio mientras se lee el token de la URL
        return (
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader><CardTitle>Cargando...</CardTitle></CardHeader>
                <CardContent>Verificando enlace...</CardContent>
            </Card>
        );
    }

    // Renderizado del formulario normal si hay token y no hay error inicial
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
                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isPending}>
                        {isPending ? "Actualizando..." : "Cambiar Contraseña"}
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    <Link href="/login" className="underline text-teal-600">
                       Volver a Iniciar Sesión
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        // Suspense sigue siendo necesario por useSearchParams
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando...</div>}>
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <ResetPasswordForm />
            </div>
        </Suspense>
    );
}