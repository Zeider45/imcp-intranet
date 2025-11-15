'use client';

import ModulePage from '@/components/ModulePage';

export default function ProjectsPage() {
  return (
    <ModulePage
      title="Gestión de Proyectos"
      description="Planifica, organiza y da seguimiento a proyectos"
      emoji="📋"
      features={[
        'Crear y gestionar proyectos',
        'Estados (planificación, activo, en pausa, completado, cancelado)',
        'Prioridades (baja, media, alta, crítica)',
        'Asignar gerente de proyecto y equipo',
        'Fechas de inicio y fin',
        'Seguimiento de progreso (0-100%)',
        'Ver tareas asociadas al proyecto',
      ]}
      apiEndpoint="/api/projects/"
    />
  );
}
