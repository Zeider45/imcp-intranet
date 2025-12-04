import { Calendar, Clock, MapPin } from 'lucide-react';

export function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: 'Capacitación: Atención al Cliente',
      date: '15 Dic 2024',
      time: '10:00 AM',
      location: 'Sala de Conferencias A',
      color: 'blue',
    },
    {
      id: 2,
      title: 'Reunión General de Personal',
      date: '18 Dic 2024',
      time: '2:00 PM',
      location: 'Auditorio Principal',
      color: 'purple',
    },
    {
      id: 3,
      title: 'Taller: Gestión de Riesgos',
      date: '20 Dic 2024',
      time: '9:00 AM',
      location: 'Sala de Capacitación',
      color: 'green',
    },
    {
      id: 4,
      title: 'Evento: Fin de Año',
      date: '22 Dic 2024',
      time: '6:00 PM',
      location: 'Hotel Plaza',
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: 'border-l-4 border-blue-500',
    green: 'border-l-4 border-green-500',
    purple: 'border-l-4 border-purple-500',
    orange: 'border-l-4 border-orange-500',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-gray-900 mb-6">Eventos Próximos</h2>
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className={`bg-gray-50 rounded-lg p-4 ${colorClasses[event.color as keyof typeof colorClasses]}`}
          >
            <p className="text-gray-900 mb-3">{event.title}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
