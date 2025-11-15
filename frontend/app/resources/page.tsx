'use client';

import ModulePage from '@/components/ModulePage';

export default function ResourcesPage() {
  return (
    <ModulePage
      title="Reserva de Recursos"
      description="Reserva salas de reuniones, equipos y escritorios"
      emoji="🔧"
      features={[
        'Reservar salas de reuniones',
        'Reservar equipos (proyectores, laptops, coches)',
        'Sistema de hot-desking (escritorios)',
        'Ver disponibilidad en tiempo real',
        'Gestionar reservas (confirmar, cancelar)',
        'Historial de reservas',
      ]}
      apiEndpoint="/api/resources/ y /api/resource-reservations/"
    />
  );
}
