'use client';

import ModulePage from '@/components/ModulePage';

export default function KPIsPage() {
  return (
    <ModulePage
      title="Indicadores Clave (KPIs)"
      description="Dashboard de métricas y resultados del negocio"
      emoji="📊"
      features={[
        'Visualizar KPIs en tiempo real',
        'Valores actuales vs objetivos',
        'Porcentaje de cumplimiento automático',
        'Filtrar por departamento y período',
        'Métricas personalizadas con unidades',
        'Histórico de KPIs',
        'Indicadores activos e inactivos',
      ]}
      apiEndpoint="/api/kpi-dashboards/"
    />
  );
}
