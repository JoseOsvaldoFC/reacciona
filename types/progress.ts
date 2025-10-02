export interface ModuleProgressDto {
  moduleId: number;
  titulo: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  pasosCompletados: number;
  pasosTotales: number;
  puntajeTotal: number;
  porcentaje: number;
}

export interface AchievementDto {
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  fechaObtencion: string;
}

export interface ProgressSummaryDto {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  totalScore: number;
  modules: ModuleProgressDto[];
  achievements: AchievementDto[];
}
