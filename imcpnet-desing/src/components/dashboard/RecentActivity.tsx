import { FileText, GraduationCap, Briefcase, MessageSquare } from 'lucide-react';

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'document',
      icon: FileText,
      title: 'Nuevo documento: Manual de Procedimientos 2024',
      user: 'María González',
      time: 'Hace 2 horas',
      color: 'blue',
    },
    {
      id: 2,
      type: 'training',
      icon: GraduationCap,
      title: 'Capacitación completada: Seguridad Bancaria',
      user: 'Juan Pérez',
      time: 'Hace 3 horas',
      color: 'green',
    },
    {
      id: 3,
      type: 'vacancy',
      icon: Briefcase,
      title: 'Nueva vacante: Analista de Crédito',
      user: 'Recursos Humanos',
      time: 'Hace 5 horas',
      color: 'purple',
    },
    {
      id: 4,
      type: 'forum',
      icon: MessageSquare,
      title: 'Nueva publicación en el foro',
      user: 'Carlos Ramírez',
      time: 'Hace 6 horas',
      color: 'orange',
    },
    {
      id: 5,
      type: 'document',
      icon: FileText,
      title: 'Política actualizada: Código de Conducta',
      user: 'Administración',
      time: 'Hace 1 día',
      color: 'blue',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-gray-900 mb-6">Actividad Reciente</h2>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[activity.color as keyof typeof colorClasses]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900">{activity.title}</p>
                <p className="text-gray-600">
                  {activity.user} · {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
