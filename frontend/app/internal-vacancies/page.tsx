'use client';

import ModulePage from '@/components/ModulePage';

export default function InternalVacanciesPage() {
  return (
    <ModulePage
      title="Vacantes Internas"
      description="Sistema de gestión de vacantes y postulaciones internas del bloque tecnológico"
      emoji="💼"
      features={[
        'Solicitud de vacante por gerente con justificación',
        'Verificación de presupuesto por RRHH',
        'Descripción de puesto con requisitos técnicos y competencias',
        'Publicación en tableros y áreas comunes',
        'Postulación interna con CV y certificados',
        'Autorización del gerente actual del empleado',
        'Matriz de comparación de candidatos',
        'Programación y registro de entrevistas',
        'Evaluación técnica y de potencial',
        'Selección del candidato y notificación',
        'Gestión de transición al nuevo puesto',
        'Actualización de directorio, permisos y expediente',
      ]}
      apiEndpoint="/api/internal-vacancies/, /api/vacancy-applications/, /api/vacancy-transitions/"
    />
  );
}
