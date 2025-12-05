import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { RecentActivityItem } from "@/components/dashboard/recent-activity-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar, TrendingUp, Plus, Send, BookOpen, Clock } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bienvenido de nuevo, Juan
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí está un resumen de tu actividad hoy
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Empleados Activos"
          value="234"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Documentos Compartidos"
          value="1,429"
          icon={FileText}
          description="Este mes"
        />
        <StatCard
          title="Eventos Próximos"
          value="8"
          icon={Calendar}
          description="Esta semana"
        />
        <StatCard
          title="Cursos Completados"
          value="156"
          icon={TrendingUp}
          trend={{ value: 23, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Nueva Solicitud"
            description="Crear solicitud de vacaciones o permiso"
            icon={Plus}
            href="/solicitudes/nueva"
          />
          <QuickActionCard
            title="Enviar Anuncio"
            description="Publicar comunicado para el equipo"
            icon={Send}
            href="/anuncios/nuevo"
          />
          <QuickActionCard
            title="Explorar Cursos"
            description="Ver catálogo de formación disponible"
            icon={BookOpen}
            href="/cursos"
          />
          <QuickActionCard
            title="Reservar Recurso"
            description="Reservar sala o equipo"
            icon={Clock}
            href="/recursos/reservar"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <RecentActivityItem
                icon="📢"
                color="primary"
                title="Nuevo anuncio publicado"
                description="Actualización de políticas de trabajo remoto"
                time="Hace 2 horas"
              />
              <RecentActivityItem
                icon="📄"
                color="chart-2"
                title="Documento compartido"
                description="María García compartió 'Informe Q1 2025'"
                time="Hace 5 horas"
              />
              <RecentActivityItem
                icon="✅"
                color="chart-3"
                title="Tarea completada"
                description="Revisión de presupuesto anual finalizada"
                time="Ayer"
              />
              <RecentActivityItem
                icon="🎓"
                color="chart-4"
                title="Curso completado"
                description="15 empleados completaron 'Seguridad Digital'"
                time="Hace 2 días"
              />
              <RecentActivityItem
                icon="👥"
                color="chart-5"
                title="Nuevo miembro"
                description="Ana López se unió al Departamento de TI"
                time="Hace 3 días"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10 flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">
                    MAR
                  </span>
                  <span className="text-lg font-bold text-primary">15</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    Reunión General Mensual
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    10:00 AM - Sala de conferencias principal
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-chart-2/10 flex-shrink-0">
                  <span className="text-xs font-semibold text-chart-2">
                    MAR
                  </span>
                  <span className="text-lg font-bold text-chart-2">18</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    Taller de Liderazgo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2:00 PM - Virtual (Zoom)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-chart-3/10 flex-shrink-0">
                  <span className="text-xs font-semibold text-chart-3">
                    MAR
                  </span>
                  <span className="text-lg font-bold text-chart-3">22</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    Celebración de Aniversario
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    6:00 PM - Área de recreación
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-chart-4/10 flex-shrink-0">
                  <span className="text-xs font-semibold text-chart-4">
                    MAR
                  </span>
                  <span className="text-lg font-bold text-chart-4">25</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    Capacitación en Software
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    9:00 AM - Laboratorio de cómputo
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
