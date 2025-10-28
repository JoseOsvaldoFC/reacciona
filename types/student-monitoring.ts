// Tipos para el monitoreo de progreso de estudiantes

export interface StudentProgressSummary {
  id: number;
  nombre: string;
  email: string;
  lastActivity: string;
  totalProgress: number;
  averageScore: number;
  completedModules: number;
  totalModules: number;
  totalTimeSpent: number; // en minutos
  achievementsCount: number;
  status: 'active' | 'inactive' | 'at-risk';
}

export interface StudentDetailedProgress {
  student: {
    id: number;
    nombre: string;
    email: string;
  };
  overallProgress: {
    totalProgress: number;
    completedModules: number;
    totalModules: number;
    totalScore: number;
    averageScore: number;
    totalTimeSpent: number;
    achievementsCount: number;
  };
  moduleProgress: ModuleProgressDetail[];
  recentActivity: ActivityRecord[];
  achievements: AchievementRecord[];
}

export interface ModuleProgressDetail {
  moduleId: number;
  titulo: string;
  tipoEmergencia: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  pasosCompletados: number;
  pasosTotales: number;
  puntajeTotal: number;
  porcentaje: number;
  timeSpent: number; // en minutos
  lastAccessed: string | null;
  attempts: number;
}

export interface ActivityRecord {
  id: number;
  tipo: 'MODULE_START' | 'MODULE_COMPLETE' | 'STEP_COMPLETE' | 'ACHIEVEMENT_EARNED';
  descripcion: string;
  fecha: string;
  puntajeObtenido?: number;
  moduloTitulo?: string;
}

export interface AchievementRecord {
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  fechaObtencion: string;
}

export interface GroupStatistics {
  groupId: number;
  groupName: string;
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageScore: number;
  completionRate: number;
  mostDifficultModule: {
    id: number;
    titulo: string;
    averageScore: number;
    completionRate: number;
  };
  recentActivity: {
    dailyActive: number[];
    weeklyProgress: number;
  };
}

export interface MonitoringFilters {
  dateFrom?: string;
  dateTo?: string;
  moduleId?: number;
  status?: 'active' | 'inactive' | 'at-risk' | 'all';
  sortBy?: 'name' | 'progress' | 'score' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
}

export interface ExportOptions {
  format: 'pdf' | 'excel';
  includeDetails: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  students?: number[]; // IDs de estudiantes específicos
}
