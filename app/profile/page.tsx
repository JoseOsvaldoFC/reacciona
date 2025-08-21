"use client"

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
    const { user, token } = useAuth();
    const router = useRouter();

    const [nombre, setNombre] = useState(user?.nombre || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isEditing, setIsEditing] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmationPassword, setConfirmationPassword] = useState('');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('http://localhost:8080/api/usuarios/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nombre, email })
        });
        if (response.ok) {
            setMessage('¡Perfil actualizado con éxito!');
            setIsEditing(false);
            // Opcional: recargar datos del usuario en el contexto
        } else {
            setError('Error al actualizar el perfil.');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (newPassword !== confirmationPassword) {
            setError("Las nuevas contraseñas no coinciden.");
            return;
        }
        const response = await fetch('http://localhost:8080/api/usuarios/me/change-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ currentPassword, newPassword, confirmationPassword })
        });
        if (response.ok) {
            setMessage('¡Contraseña actualizada con éxito!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmationPassword('');
        } else {
            const errorText = await response.text();
            setError(errorText || 'Error al cambiar la contraseña.');
        }
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
                            <Input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={!isEditing} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} />
                        </div>
                        
                        {isEditing ? (
                            <div className="flex gap-2">
                                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Guardar</Button>
                                <Button type="button" variant="outline" className="w-full" onClick={() => setIsEditing(false)}>Cancelar</Button>
                            </div>
                        ) : (
                            <Button type="button" onClick={() => setIsEditing(true)}>Editar Perfil</Button>
                        )}
                    </form>

                    <Separator className="my-6" />

                    {/* FORMULARIO DE CAMBIO DE CONTRASEÑA */}
                    <form onSubmit={handleChangePassword} className="grid gap-4">
                         <h3 className="text-lg font-semibold">Cambiar Contraseña</h3>
                         <div className="grid gap-2">
                            <Label htmlFor="currentPassword">Contraseña Actual</Label>
                            <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">Nueva Contraseña</Label>
                            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmationPassword">Confirmar Nueva Contraseña</Label>
                            <Input id="confirmationPassword" type="password" value={confirmationPassword} onChange={(e) => setConfirmationPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">Actualizar Contraseña</Button>
                    </form>

                    {message && <p className="text-sm text-center text-green-600 mt-4">{message}</p>}
                    {error && <p className="text-sm text-center text-red-600 mt-4">{error}</p>}
                    
                    <Link href="/" className="inline-block w-full text-center text-sm p-2 hover:underline text-teal-600 mt-4">
                       Volver al Dashboard
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}