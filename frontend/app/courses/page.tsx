'use client';

import ModulePage from '@/components/ModulePage';

export default function CoursesPage() {
  return (
    <ModulePage
      title="Centro de Formación (LMS)"
      description="Sistema de gestión de aprendizaje y cursos internos"
      emoji="🎓"
      features={[
        'Catálogo de cursos internos',
        'Inscripción a cursos',
        'Seguimiento de progreso (0-100%)',
        'Cursos obligatorios y opcionales',
        'Certificados digitales',
        'Contenido de formación y materiales',
        'Instructores y departamentos',
      ]}
      apiEndpoint="/api/courses/ y /api/course-enrollments/"
    />
  );
}
