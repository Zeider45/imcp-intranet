'use client';

import ModulePage from '@/components/ModulePage';

export default function QuickLinksPage() {
  return (
    <ModulePage
      title="Enlaces de Interés"
      description="Accesos directos a herramientas externas importantes"
      emoji="🔗"
      features={[
        'Enlaces a CRM, ERP, sistemas de nóminas',
        'Categorización (CRM, ERP, HR, Finance, etc.)',
        'Iconos personalizados para cada enlace',
        'Orden personalizable',
        'Enlaces por departamento',
        'Activar/desactivar enlaces',
        'Descripción de cada herramienta',
      ]}
      apiEndpoint="/api/quick-links/"
    />
  );
}
