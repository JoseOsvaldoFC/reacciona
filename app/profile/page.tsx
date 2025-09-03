"use client"

import { useState, useEffect, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, token, isAuthenticated, isLoading, refetchUser } = useAuth();
    const router = useRouter();

    // Estado para el modo de edición del perfil
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    
    // Estados para los datos del perfil
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');

    // Estados para el formulario de cambio de contraseña
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmationPassword, setConfirmationPassword] = useState('');

    // Estado de "pending" para deshabilitar botones durante las peticiones
    const [isPending, startTransition] = useTransition();

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
        if (user) {
            setNombre(user.nombre);
            setEmail(user.email);
        }
    }, [isLoading, isAuthenticated, user, router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const response = await fetch('http://localhost:8080/api/usuarios/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre, email })
            });
            if (response.ok) {
                toast.success('¡Perfil actualizado con éxito!');
                setIsEditingProfile(false);
                refetchUser(); // Recargamos los datos del usuario en el contexto
            } else {
                toast.error('Error al actualizar el perfil.');
            }
        });
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmationPassword) {
            toast.error("Las nuevas contraseñas no coinciden.");
            return;
        }
        startTransition(async () => {
            const response = await fetch('http://localhost:8080/api/usuarios/me/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ currentPassword, newPassword, confirmationPassword })
            });
            if (response.ok) {
                toast.success('¡Contraseña actualizada con éxito! Se ha enviado un correo de notificación.');
                // Limpiamos los campos por seguridad
                setCurrentPassword('');
                setNewPassword('');
                setConfirmationPassword('');
            } else {
                const errorText = await response.text();
                toast.error(errorText || 'Error al cambiar la contraseña.');
            }
        });
    };
    
    if (!user) return <div className="flex h-screen items-center justify-center">Cargando perfil...</div>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="mx-auto max-w-lg w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Mi Perfil</CardTitle>
                    <CardDescription>Aquí puedes ver y actualizar tus datos.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* FORMULARIO DE DATOS DE PERFIL */}
                    <form onSubmit={handleUpdateProfile} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={!isEditingProfile || isPending} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditingProfile || isPending} />
                        </div>
                        
                        {isEditingProfile ? (
                            <div className="flex gap-2">
                                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isPending}>Guardar</Button>
                                <Button type="button" variant="outline" className="w-full" onClick={() => setIsEditingProfile(false)} disabled={isPending}>Cancelar</Button>
                            </div>
                        ) : (
                            <Button type="button" onClick={() => setIsEditingProfile(true)}>Editar Perfil</Button>
                        )}
                    </form>

                    <Separator className="my-6" />

                    {/* FORMULARIO DE CAMBIO DE CONTRASEÑA */}
                    <form onSubmit={handleChangePassword} className="grid gap-4">
                         <h3 className="text-lg font-semibold">Cambiar Contraseña</h3>
                         <div className="grid gap-2">
                            <Label htmlFor="currentPassword">Contraseña Actual</Label>
                            <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={isPending}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">Nueva Contraseña</Label>
                            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isPending}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmationPassword">Confirmar Nueva Contraseña</Label>
                            <Input id="confirmationPassword" type="password" value={confirmationPassword} onChange={(e) => setConfirmationPassword(e.target.value)} required disabled={isPending}/>
                        </div>
                        <Button type="submit" className="w-full" disabled={isPending}>Actualizar Contraseña</Button>
                    </form>
                    
                    <Link href="/" className="inline-block w-full text-center text-sm p-2 hover:underline text-teal-600 mt-4">
                       Volver al Dashboard
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}