'use client';

import ModulePage from '@/components/ModulePage';

export default function CalendarPage() {
  return (
    <ModulePage
      title="Calendario Corporativo"
      description="Gestiona eventos, festivos y fechas importantes de la empresa"
      emoji="📅"
      features={[
        'Visualizar eventos corporativos y reuniones',
        'Gestionar festivos y días importantes',
        'Crear eventos con asistentes',
        'Filtrar por tipo de evento (festivo, reunión, evento, deadline)',
        'Ver eventos próximos',
        'Notificaciones de eventos importantes',
      ]}
      apiEndpoint="/api/calendar-events/"
    />
  );
}
