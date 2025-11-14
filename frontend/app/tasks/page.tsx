'use client';

import ModulePage from '@/components/ModulePage';

export default function TasksPage() {
  return (
    <ModulePage
      title="Gestión de Tareas"
      description="Asigna, seguimiento y reporta el estado de tareas"
      emoji="✅"
      features={[
        'Crear y asignar tareas',
        'Estados (por hacer, en progreso, en revisión, hecho, bloqueado)',
        'Prioridades (baja, media, alta, urgente)',
        'Asociar tareas a proyectos',
        'Fechas de vencimiento',
        'Ver mis tareas asignadas',
        'Filtrar por estado, prioridad y proyecto',
      ]}
      apiEndpoint="/api/tasks/"
    />
  );
}
