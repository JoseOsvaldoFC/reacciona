import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface TeacherClass {
  id: number;
  name: string;
  description: string;
  studentCount: number;
}

export function useTeacherClasses() {
  const { token, isLoading: authLoading } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    if (authLoading || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/monitoring/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setClasses(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

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