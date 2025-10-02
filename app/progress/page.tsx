"use client";
import { useProgress } from '@/hooks/useProgress';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProgressPage() {
  const { data, loading, error, filters, setFilters, refetch, emergencyTypes } = useProgress();
  const [from, setFrom] = useState(filters.from || '');
  const [to, setTo] = useState(filters.to || '');
  const [tipoEmergencia, setTipoEmergencia] = useState<string>('ALL');

  const applyFilters = () => {
    setFilters({ from, to, tipoEmergencia: tipoEmergencia === 'ALL' ? undefined : tipoEmergencia });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Mi Progreso</h1>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-sm font-medium">Desde</label>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Hasta</label>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="w-48">
          <label className="text-sm font-medium">Tipo de Emergencia</label>
          <Select value={tipoEmergencia} onValueChange={v => setTipoEmergencia(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {emergencyTypes.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={applyFilters} disabled={loading}>Aplicar</Button>
  <Button variant="outline" onClick={() => { setFrom(''); setTo(''); setTipoEmergencia('ALL'); setFilters({}); }} disabled={loading}>Limpiar</Button>
      </div>

      {loading && <div>Cargando progreso...</div>}
      {error && (
        <div className="text-red-600 text-sm space-x-2">
          <span>{error}</span>
          {error.includes('404') && <span>No se encontró el endpoint. Verifica que el backend está corriendo en {process.env.NEXT_PUBLIC_API_BASE_URL} y que no hay un proxy pendiente.</span>}
          {error.includes('401') || error.includes('403') ? <span>Inicia sesión nuevamente.</span> : null}
          <Button variant="link" onClick={() => refetch()}>Reintentar</Button>
        </div>
      )}
      {!loading && !error && data && data.modules.length === 0 && (
        <div>No hay progreso registrado todavía. ¡Comienza un módulo!</div>
      )}

      {data && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Resumen General</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Módulos</p>
                <p className="text-2xl font-semibold">{data.totalModules}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-semibold text-green-600">{data.completedModules}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En progreso</p>
                <p className="text-2xl font-semibold text-yellow-600">{data.inProgressModules}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Puntaje total</p>
                <p className="text-2xl font-semibold">{data.totalScore}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 space-y-4 p-4">
            <h2 className="text-xl font-semibold">Módulos</h2>
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
              {data.modules.map(m => (
                <div key={m.moduleId} className="border rounded p-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{m.titulo}</span>
                    <Badge variant={m.status === 'COMPLETED' ? 'default' : m.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}>{m.status === 'NOT_STARTED' ? 'No iniciado' : m.status === 'IN_PROGRESS' ? 'En progreso' : 'Completado'}</Badge>
                  </div>
                  <Progress value={m.porcentaje} />
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{m.pasosCompletados}/{m.pasosTotales} pasos</span>
                    <span>{m.puntajeTotal} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 p-4">
            <h2 className="text-xl font-semibold">Logros</h2>
            <div className="flex flex-wrap gap-2">
              {data.achievements.length === 0 && <p className="text-sm text-muted-foreground">Sin logros aún.</p>}
              {data.achievements.map(a => (
                <div key={a.codigo} className="w-28 h-28 border rounded flex flex-col items-center justify-center text-center p-2">
                  <div className="text-2xl">🏅</div>
                  <span className="text-xs font-medium line-clamp-2">{a.nombre}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
