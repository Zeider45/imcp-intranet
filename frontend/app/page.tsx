import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { RecentActivityItem } from "@/components/dashboard/recent-activity-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar, BookOpen, GraduationCap, TrendingUp, Plus, Send, Clock } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">
          Bienvenido a la Intranet
        </h1>
        <p className="text-gray-600">
          Panel de control principal
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Empleados"
          value="1,247"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Documentos Compartidos"
          value="856"
          icon={FileText}
          color="green"
        />
        <StatCard
          title="Eventos Próximos"
          value="12"
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Cursos Completados"
          value="342"
          icon={BookOpen}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Nuevo documento: Manual de Procedimientos 2024</p>
                    <p className="text-sm text-gray-600">María González · Hace 2 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Capacitación completada: Seguridad Bancaria</p>
                    <p className="text-sm text-gray-600">Juan Pérez · Hace 3 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-50 text-purple-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Nueva vacante: Analista de Crédito</p>
                    <p className="text-sm text-gray-600">Recursos Humanos · Hace 5 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Política actualizada: Código de Conducta</p>
                    <p className="text-sm text-gray-600">Administración · Hace 1 día</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos Próximos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-gray-900 mb-3">Capacitación: Atención al Cliente</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>15 Dic 2024</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>10:00 AM</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="text-sm font-medium text-gray-900 mb-3">Reunión General de Personal</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>18 Dic 2024</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>2:00 PM</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-sm font-medium text-gray-900 mb-3">Taller: Gestión de Riesgos</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>20 Dic 2024</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>9:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <QuickActionCard
                  title="Subir Documento"
                  description="Agregar nuevo documento"
                  icon={Plus}
                  href="/library-documents"
                />
                <QuickActionCard
                  title="Ver Calendario"
                  description="Revisar eventos próximos"
                  icon={Calendar}
                  href="/"
                />
                <QuickActionCard
                  title="Ver Vacantes"
                  description="Explorar oportunidades"
                  icon={Users}
                  href="/internal-vacancies"
                />
                <QuickActionCard
                  title="Nueva Publicación"
                  description="Publicar en el foro"
                  icon={Send}
                  href="/forum"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Publicaciones del Foro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 text-xs font-bold">
                      AM
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">Ana Martínez</p>
                        <span className="text-gray-400">·</span>
                        <p className="text-xs text-gray-600">Hace 1 hora</p>
                      </div>
                      <p className="text-xs text-gray-600">Gerente de Operaciones</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">¡Felicitaciones al equipo de atención al cliente por alcanzar el 98% de satisfacción este mes! 🎉</p>
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 text-xs font-bold">
                      RS
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">Roberto Silva</p>
                        <span className="text-gray-400">·</span>
                        <p className="text-xs text-gray-600">Hace 3 horas</p>
                      </div>
                      <p className="text-xs text-gray-600">Director de Recursos Humanos</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">Recordatorio: La capacitación de seguridad bancaria es obligatoria para todos los empleados. Fecha límite: 20 de diciembre.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
