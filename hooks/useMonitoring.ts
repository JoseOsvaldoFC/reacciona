import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { 
  StudentProgressSummary, 
  StudentDetailedProgress, 
  GroupStatistics, 
  MonitoringFilters 
} from '@/types/student-monitoring';

export function useMonitoring(groupId?: number) {
  const { token, isLoading: authLoading, user } = useAuth();
  const [groupStats, setGroupStats] = useState<GroupStatistics | null>(null);
  const [students, setStudents] = useState<StudentProgressSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MonitoringFilters>({
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const fetchGroupStatistics = useCallback(async (id: number) => {
    if (authLoading || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Si id es -1, es la opción "Todos" (solo para admin)
      const endpoint = id === -1 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/monitoring/all-students/statistics`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/monitoring/group/${id}/statistics`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setGroupStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas del grupo');
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

  const fetchStudents = useCallback(async (id: number, activeFilters: MonitoringFilters = filters) => {
    if (authLoading || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (activeFilters.dateFrom) params.append('dateFrom', activeFilters.dateFrom);
      if (activeFilters.dateTo) params.append('dateTo', activeFilters.dateTo);
      if (activeFilters.moduleId) params.append('moduleId', String(activeFilters.moduleId));
      if (activeFilters.status && activeFilters.status !== 'all') params.append('status', activeFilters.status);
      if (activeFilters.sortBy) params.append('sortBy', activeFilters.sortBy);
      if (activeFilters.sortOrder) params.append('sortOrder', activeFilters.sortOrder);
      
      const queryString = params.toString();
      
      // Si id es -1, es la opción "Todos" (solo para admin)
      const endpoint = id === -1
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/monitoring/all-students`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/monitoring/group/${id}/students`;
      
      const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar lista de estudiantes');
    } finally {
      setLoading(false);
    }
  }, [token, authLoading, filters]);

  const fetchStudentDetails = useCallback(async (studentId: number): Promise<StudentDetailedProgress | null> => {
    if (authLoading || !token) return null;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/monitoring/student/${studentId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err: any) {
      setError(err.message || 'Error al cargar detalles del estudiante');
      return null;
    }
  }, [token, authLoading]);

  const updateFilters = useCallback((newFilters: Partial<MonitoringFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    if (groupId) {
      fetchStudents(groupId, updatedFilters);
    }
  }, [filters, groupId, fetchStudents]);

  const refreshData = useCallback(() => {
    if (groupId) {
      fetchGroupStatistics(groupId);
      fetchStudents(groupId);
    }
  }, [groupId, fetchGroupStatistics, fetchStudents]);

  const exportGroupData = useCallback(async (groupId: number = 1) => {
    if (authLoading || !token) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/monitoring/group/${groupId}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al exportar datos del grupo');
      }

      const data = await response.json();
      
      // Crear el archivo CSV
      const csvContent = generateCSV(data);
      
      // Descargar el archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `grupo_${groupId}_progreso_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al exportar datos');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

  const generateCSV = (exportData: any) => {
    const headers = [
      'Nombre',
      'Email', 
      'Progreso Total (%)',
      'Puntaje Promedio',
      'Última Actividad',
      'Estado',
      'Módulos Completados',
      'Actividades Completadas'
    ];

    const rows = exportData.students.map((student: any) => [
      `"${student.nombre}"`,
      `"${student.email}"`,
      student.totalProgress,
      student.averageScore,
      `"${student.lastActivity}"`,
      `"${student.status}"`,
      student.modulesCompleted,
      student.activitiesCompleted
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(','))
    ].join('\n');

    return csvContent;
  };

  // Auto-fetch cuando se proporciona groupId
  useEffect(() => {
    if (groupId) {
      refreshData();
    }
  }, [groupId, refreshData]);

  return {
    // Data
    groupStats,
    students,
    
    // State
    loading,
    error,
    filters,
    
    // Actions
    updateFilters,
    refreshData,
    fetchStudentDetails,
    exportGroupData,
    
    // Manual fetch functions
    fetchGroupStatistics,
    fetchStudents
  };
}

// Hook específico para detalles de un estudiante
export function useStudentDetails(studentId: number) {
  const { token, isLoading: authLoading } = useAuth();
  const [studentDetails, setStudentDetails] = useState<StudentDetailedProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (authLoading || !token || !studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/monitoring/student/${studentId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStudentDetails(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar detalles del estudiante');
    } finally {
      setLoading(false);
    }
  }, [token, authLoading, studentId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    studentDetails,
    loading,
    error,
    refreshDetails: fetchDetails
  };
}
