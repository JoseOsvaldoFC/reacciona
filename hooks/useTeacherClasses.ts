import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface TeacherClass {
  id: number;
  name: string;
  description: string;
  studentCount: number;
}

export function useTeacherClasses() {
  const { token, isLoading: authLoading, user } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    if (authLoading || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      let data: any[] = [];

      // Si es admin, obtener todas las clases del sistema desde /api/clases
      if (user?.idRol === 3) {
        const adminResp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clases`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!adminResp.ok) {
          throw new Error(`Error ${adminResp.status}: ${adminResp.statusText}`);
        }
        const raw = await adminResp.json();
        // Mapear a TeacherClass
        data = (raw || []).map((c: any) => ({
          id: c.id,
          name: c.nombreClase,
          description: c.descripcion,
          studentCount: Array.isArray(c.alumnos) ? c.alumnos.length : 0
        }));
      } else {
        // Docente normal: clases asignadas
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/monitoring/classes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        data = await response.json();
      }

      // Ordenar por nombre para UX consistente
      data.sort((a, b) => a.name.localeCompare(b.name));
      setClasses(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  }, [token, authLoading, user]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    classes,
    loading,
    error,
    refreshClasses: fetchClasses
  };
}