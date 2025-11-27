'use client';

import ModulePage from '@/components/ModulePage';

export default function TechnicalDocumentsPage() {
  return (
    <ModulePage
      title="Consulta de Documentación Técnica"
      description="Sistema de gestión y consulta de documentación técnica del IMCP"
      emoji="📚"
      features={[
        'Catálogo de documentos técnicos (manuales, procedimientos, políticas)',
        'Índice maestro con ubicación física',
        'Sistema de autorización de acceso por usuario',
        'Versiones y estados de documentos',
        'Documentos digitalizados disponibles',
        'Búsqueda por código, título y tipo',
        'Filtrado por departamento y estado',
      ]}
      apiEndpoint="/api/technical-documents/"
    />
  );
}
