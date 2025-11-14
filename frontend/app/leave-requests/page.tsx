'use client';

import ModulePage from '@/components/ModulePage';

export default function LeaveRequestsPage() {
  return (
    <ModulePage
      title="Solicitudes de Vacaciones/Permisos"
      description="Sistema de solicitud y aprobación de días libres"
      emoji="🏖️"
      features={[
        'Solicitar vacaciones, permisos y días libres',
        'Flujo de aprobación con comentarios',
        'Ver estado de solicitudes (pendiente, aprobada, rechazada)',
        'Historial de solicitudes',
        'Notificaciones de aprobación/rechazo',
        'Panel de aprobación para supervisores',
      ]}
      apiEndpoint="/api/leave-requests/"
    />
  );
}
