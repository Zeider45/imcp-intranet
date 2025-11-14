'use client';

import ModulePage from '@/components/ModulePage';

export default function SuggestionsPage() {
  return (
    <ModulePage
      title="Buzón de Sugerencias"
      description="Canal para enviar ideas y mejorar la empresa"
      emoji="💡"
      features={[
        'Enviar sugerencias anónimas o públicas',
        'Sistema de votación (upvotes)',
        'Estados de revisión (enviado, en revisión, aprobado, rechazado, implementado)',
        'Comentarios del revisor',
        'Categorización de sugerencias',
        'Historial de sugerencias',
        'Panel de gestión para revisores',
      ]}
      apiEndpoint="/api/suggestions/"
    />
  );
}
