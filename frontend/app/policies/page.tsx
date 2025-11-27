'use client';

import ModulePage from '@/components/ModulePage';

export default function PoliciesPage() {
  return (
    <ModulePage
      title="Establecer Políticas"
      description="Sistema para crear, revisar y publicar políticas tecnológicas institucionales"
      emoji="📜"
      features={[
        'Creación de políticas con origen (SUDEBAN, BCV, auditoría, mejora)',
        'Plantilla oficial de políticas',
        'Revisión por gerentes pares y auditor interno',
        'Registro de minutas de reunión de revisión',
        'Aprobación por junta directiva',
        'Publicación oficial con fecha de vigencia',
        'Distribución de copias controladas',
        'Acuse de recibo del personal',
        'Historial de políticas obsoletas',
        'Control de versiones y reemplazos',
      ]}
      apiEndpoint="/api/policies/ y /api/policy-distributions/"
    />
  );
}
