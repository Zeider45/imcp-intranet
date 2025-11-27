'use client';

import ModulePage from '@/components/ModulePage';

export default function TrainingSessionsPage() {
  return (
    <ModulePage
      title="Asistencia a Capacitaciones"
      description="Sistema de convocatoria, confirmación y asistencia a sesiones de capacitación"
      emoji="🎓"
      features={[
        'Convocatoria oficial de capacitación',
        'Confirmación o justificación de asistencia',
        'Fechas límite de confirmación',
        'Adjuntar documentos de justificación',
        'Lista de asistencia con firma',
        'Registro de hora de llegada y salida',
        'Evaluación de conocimientos',
        'Emisión de certificados de participación',
        'Estados: Presente, Ausente Justificado, Ausente Injustificado, Tardanza',
        'Próximas sesiones programadas',
      ]}
      apiEndpoint="/api/training-sessions/ y /api/training-attendances/"
    />
  );
}
