'use client';

import ModulePage from '@/components/ModulePage';

export default function DocumentDraftsPage() {
  return (
    <ModulePage
      title="Elaboración de Documentación"
      description="Sistema para crear y gestionar borradores de documentación técnica"
      emoji="✍️"
      features={[
        'Plantillas según tipo de documento (manual técnico, guía de usuario, especificación funcional)',
        'Editor de contenido de documentación',
        'Control de versiones de borradores',
        'Sistema de documentación del sistema/funcionalidad',
        'Envío para revisión al gerente',
        'Estados de borrador, en revisión, aprobado, rechazado',
        'Archivos adjuntos de documentos',
        'Historial de mis borradores',
      ]}
      apiEndpoint="/api/document-drafts/"
    />
  );
}
