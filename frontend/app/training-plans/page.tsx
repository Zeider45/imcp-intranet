'use client';

import ModulePage from '@/components/ModulePage';

export default function TrainingPlansPage() {
  return (
    <ModulePage
      title="Planificación de Capacitaciones"
      description="Sistema para planificar y gestionar capacitaciones técnicas para analistas"
      emoji="📅"
      features={[
        'Planes de capacitación por origen (evaluación, nueva tecnología, normativa, auditoría)',
        'Alcance intergerencial e interdepartamental',
        'Revisión y aprobación de presupuesto',
        'Gestión de proveedores de capacitación',
        'Cotizaciones con temario, costo y fechas',
        'Selección de instructor y cotización',
        'Asignación de gerente para selección de participantes',
        'Perfil de instructor requerido',
        'Calendario anual de capacitaciones',
      ]}
      apiEndpoint="/api/training-plans/, /api/training-providers/, /api/training-quotations/"
    />
  );
}
