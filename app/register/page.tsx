"use client"

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { toast } from 'sonner';

// Politica de contraseña (la misma que en el backend)
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const PASSWORD_POLICY_MESSAGE = "Debe tener 8+ caracteres, mayúscula, minúscula y número.";

export default function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPending, startTransition] = useTransition();

    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    useEffect(() => {
        if (password === '') {
            setPasswordError(null);
            setIsPasswordValid(false);
            return;
        }
        const isValid = PASSWORD_REGEX.test(password);
        setIsPasswordValid(isValid);
        setPasswordError(isValid ? null : PASSWORD_POLICY_MESSAGE);
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast.error(PASSWORD_POLICY_MESSAGE);
            return;
        }

        if (!nombre || !email || !password){
            toast.error('Todos los campos son obligatorios.');
            return;
        }
        startTransition(async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
                const response = await fetch(`${apiUrl}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, password }),
                });

                if (!response.ok) {
                    let errorMessage = 'Error al registrar el usuario';
                    let bodyText = await response.text();
                    try {
                        const errorData = JSON.parse(bodyText);
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = bodyText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                toast.success('¡Registro exitoso!', {
                    description: 'Ya puedes iniciar sesión con tu nueva cuenta.',
                });

                setNombre('');
                setEmail('');
                setPassword('');

            } catch (err: any) {
                toast.error(err.message);
            }
        });
    };
    
return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                    <CardDescription>Ingresa tus datos para registrarte en Reacciona.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        {/* Campo Nombre */}
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input
                                id="nombre"
                                type="text"
                                placeholder="Tu nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                disabled={isPending}
                            />
                        </div>
                        {/* Campo Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isPending}
                             />
                        </div>
                        {/* Campo Contraseña con Validación */}
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isPending}
                                // Añadimos clases condicionales para el borde rojo si hay error
                                className={passwordError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                             />
                             {/* Mostramos el mensaje de error debajo del input */}
                             {passwordError && (
                                <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                             )}
                        </div>

                        {/* Botón deshabilitado si la contraseña no es válida */}
                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            disabled={isPending || !isPasswordValid && password !== ''} // Deshabilitado si está pendiente o si la contraseña no es válida (y no está vacía)
                        >
                            {isPending ? "Creando cuenta..." : "Crear mi cuenta"}
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