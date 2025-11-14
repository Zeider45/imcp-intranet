'use client';

import ModulePage from '@/components/ModulePage';

export default function ForumsPage() {
  return (
    <ModulePage
      title="Foros de Discusión"
      description="Espacios para interacción entre equipos y empleados"
      emoji="💬"
      features={[
        'Categorías de foros por temas',
        'Crear discusiones y respuestas',
        'Publicaciones fijadas e importantes',
        'Sistema de hilos (posts y respuestas)',
        'Contador de vistas y respuestas',
        'Bloqueo de posts cuando sea necesario',
        'Búsqueda en discusiones',
      ]}
      apiEndpoint="/api/forum-categories/ y /api/forum-posts/"
    />
  );
}
