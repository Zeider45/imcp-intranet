'use client';

import ModulePage from '@/components/ModulePage';

export default function DocumentLoansPage() {
  return (
    <ModulePage
      title="Bitácora de Préstamos de Documentos"
      description="Registro y control de préstamos de documentación técnica"
      emoji="📋"
      features={[
        'Solicitud de préstamo de documentos',
        'Flujo de aprobación por asistente administrativo',
        'Registro de entrega y firma del analista',
        'Control de fechas de devolución',
        'Verificación de devolución de documentos',
        'Alertas de documentos vencidos',
        'Historial completo de préstamos',
        'Trazabilidad de consultas',
      ]}
      apiEndpoint="/api/document-loans/"
    />
  );
}
