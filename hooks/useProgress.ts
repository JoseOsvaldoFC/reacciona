import { useCallback, useEffect, useState, useRef } from 'react';
import { ProgressSummaryDto } from '@/types/progress';
import { useAuth } from '@/context/AuthContext';

interface Filters {
  from?: string; // yyyy-mm-dd
  to?: string;   // yyyy-mm-dd
  moduleId?: number; // (opcional) filtro por módulo
  tipoEmergencia?: string; // nuevo filtro dinámico
}

interface ModuleOption { id: number; titulo: string; tipoEmergencia?: string | null; }

export function useProgress(initialFilters: Filters = {}) {
  const { token, isLoading: authLoading } = useAuth();
  const firstLogRef = useRef(false);
  const [data, setData] = useState<ProgressSummaryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [emergencyTypes, setEmergencyTypes] = useState<string[]>([]);
  const modulesLoadedRef = useRef(false);

  const buildQuery = (f: Filters) => {
    const params = new URLSearchParams();
    if (f.from) params.append('from', f.from);
    if (f.to) params.append('to', f.to);
  if (f.moduleId) params.append('moduleId', String(f.moduleId));
  if (f.tipoEmergencia && f.tipoEmergencia !== 'ALL') params.append('tipoEmergencia', f.tipoEmergencia);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const fetchData = useCallback(async (activeFilters: Filters = filters) => {
    // No dispares si todavía se está resolviendo el estado de autenticación
    if (authLoading) return;
    if (!token) { // usuario aún no autenticado: dejamos data en null pero no mostramos error todavía
      if (!data) setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      let res: Response;
      try {
        const url = `${base}/api/progress/summary${buildQuery(activeFilters)}`;
        if (!firstLogRef.current) {
          // Log solo una vez para debug
            // eslint-disable-next-line no-console
          const snippet = token ? token.slice(0,10) + '...' + token.slice(-10) : 'null';
          console.log('[useProgress] Fetching:', url, 'tokenPresent=', !!token, 'tokenSnippet=', snippet);
          firstLogRef.current = true;
        }
        res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (netErr) {
        throw new Error('No se pudo conectar con el backend (¿backend caído o URL incorrecta?).');
      }
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('No autorizado (token inválido o expirado).');
        }
        if (res.status === 404) {
          throw new Error('Endpoint /api/progress/summary no encontrado (404).');
        }
        throw new Error(`Error HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [filters, token, authLoading]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateFilters = (next: Filters) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    fetchData(merged);
  };

  // Cargar módulos una sola vez cuando tengamos token
  useEffect(() => {
    if (authLoading || !token || modulesLoadedRef.current) return;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    fetch(`${base}/api/modulos`, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(list => {
        const opts: ModuleOption[] = list.map((m: any) => ({ id: m.id, titulo: m.titulo, tipoEmergencia: m.tipoEmergencia }));
        setModules(opts);
        const distinct = Array.from(new Set(opts.filter(o => !!o.tipoEmergencia).map(o => o.tipoEmergencia!)));
        distinct.sort();
        setEmergencyTypes(distinct);
        modulesLoadedRef.current = true;
      })
      .catch(() => {/* silencioso */});
  }, [authLoading, token]);

  return { data, loading, error, filters, setFilters: updateFilters, refetch: () => fetchData(), modules, emergencyTypes };
}
