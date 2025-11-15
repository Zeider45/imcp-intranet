'use client';

import ModulePage from '@/components/ModulePage';

export default function KnowledgePage() {
  return (
    <ModulePage
      title="Base de Conocimientos / FAQ"
      description="Repositorio de artículos, tutoriales y respuestas frecuentes"
      emoji="💡"
      features={[
        'Artículos y tutoriales internos',
        'Preguntas frecuentes (FAQ)',
        'Guías y políticas corporativas',
        'Sistema de etiquetas para organización',
        'Búsqueda por contenido',
        'Contador de vistas y utilidad',
        'Artículos populares',
      ]}
      apiEndpoint="/api/knowledge-articles/"
    />
  );
}
