import { FileUp, Calendar, Briefcase, MessageSquarePlus } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      id: 1,
      label: 'Subir Documento',
      icon: FileUp,
      color: 'blue',
    },
    {
      id: 2,
      label: 'Ver Calendario',
      icon: Calendar,
      color: 'green',
    },
    {
      id: 3,
      label: 'Ver Vacantes',
      icon: Briefcase,
      color: 'purple',
    },
    {
      id: 4,
      label: 'Nueva Publicación',
      icon: MessageSquarePlus,
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-gray-900 mb-6">Acciones Rápidas</h2>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white transition-colors ${colorClasses[action.color as keyof typeof colorClasses]}`}
            >
              <Icon className="w-5 h-5" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
