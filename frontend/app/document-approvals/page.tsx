'use client';

import ModulePage from '@/components/ModulePage';

export default function DocumentApprovalsPage() {
  return (
    <ModulePage
      title="Aprobación de Documentación"
      description="Sistema de revisión y aprobación de documentación técnica por gerentes"
      emoji="✅"
      features={[
        'Bandeja de documentos pendientes de revisión',
        'Decisiones: Aprobar, Aprobar con observaciones, Rechazar',
        'Registro de observaciones técnicas',
        'Establecimiento de plazos para correcciones',
        'Firma digital del revisor',
        'Indicador de aprobación de junta directiva',
        'Fecha de vigencia de documentos aprobados',
        'Distribución de copias controladas',
      ]}
      apiEndpoint="/api/document-approvals/"
    />
  );
}
