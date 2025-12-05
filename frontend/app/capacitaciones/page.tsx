'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, CheckCircle, Plus, Search } from 'lucide-react';

interface Capacitacion {
  id: number;
  title: string;
  instructor: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  status: 'asignada' | 'completada';
  progress: number;
}

export default function CapacitacionesPage() {
  const [activeTab, setActiveTab] = useState<'asignadas' | 'asistidas' | 'calendario'>('asignadas');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const isAdmin = true; // TODO: Get from auth context

  const capacitaciones: Capacitacion[] = [
    {
      id: 1,
      title: 'Seguridad Bancaria Avanzada',
      instructor: 'Carlos Mendoza',
      date: '2024-12-15',
      time: '10:00 AM - 12:00 PM',
      location: 'Sala de Conferencias A',
      attendees: 25,
      maxAttendees: 30,
      status: 'asignada',
      progress: 0,
    },
    {
      id: 2,
      title: 'Atención al Cliente Excellence',
      instructor: 'María Rodríguez',
      date: '2024-12-18',
      time: '2:00 PM - 4:00 PM',
      location: 'Auditorio Principal',
      attendees: 40,
      maxAttendees: 50,
      status: 'asignada',
      progress: 0,
    },
    {
      id: 3,
      title: 'Gestión de Riesgos Crediticios',
      instructor: 'Roberto Silva',
      date: '2024-12-20',
      time: '9:00 AM - 1:00 PM',
      location: 'Sala de Capacitación',
      attendees: 15,
      maxAttendees: 20,
      status: 'asignada',
      progress: 0,
    },
    {
      id: 4,
      title: 'Nuevas Tecnologías Bancarias',
      instructor: 'Ana Martínez',
      date: '2024-11-28',
      time: '10:00 AM - 12:00 PM',
      location: 'Lab de Tecnología',
      attendees: 30,
      maxAttendees: 30,
      status: 'completada',
      progress: 100,
    },
    {
      id: 5,
      title: 'Compliance y Normativas',
      instructor: 'Jorge López',
      date: '2024-11-20',
      time: '3:00 PM - 5:00 PM',
      location: 'Sala Virtual',
      attendees: 50,
      maxAttendees: 50,
      status: 'completada',
      progress: 100,
    },
    {
      id: 6,
      title: 'Liderazgo y Trabajo en Equipo',
      instructor: 'Laura Fernández',
      date: '2024-11-15',
      time: '9:00 AM - 5:00 PM',
      location: 'Centro de Convenciones',
      attendees: 35,
      maxAttendees: 40,
      status: 'completada',
      progress: 100,
    },
  ];

  const asignadas = capacitaciones.filter((c) => c.status === 'asignada');
  const asistidas = capacitaciones.filter((c) => c.status === 'completada');

  if (isAdmin && showAssignForm) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={() => setShowAssignForm(false)}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Asignar Capacitación</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Training Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nueva Capacitación</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de la capacitación"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del instructor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Lugar de la capacitación"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cupo Máximo</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de participantes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detalles de la capacitación"
                />
              </div>
            </form>
          </div>

          {/* Assign to Employees */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Asignar Empleados</h2>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar empleados..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
              {[
                'Juan Pérez - Operaciones',
                'María González - Atención al Cliente',
                'Carlos Ramírez - Créditos',
                'Ana Martínez - Recursos Humanos',
                'Roberto Silva - Administración',
                'Laura Fernández - Tecnología',
                'Jorge López - Cumplimiento',
                'Patricia Torres - Ventas',
              ].map((employee, index) => (
                <label key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">{employee}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Crear y Asignar
              </button>
              <button
                onClick={() => setShowAssignForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Capacitaciones</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gestión de capacitaciones y asignación' : 'Tus capacitaciones asignadas y completadas'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAssignForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Asignar Capacitación
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('asignadas')}
          className={`px-4 py-2 transition-colors relative ${
            activeTab === 'asignadas'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Asignadas ({asignadas.length})
          {activeTab === 'asignadas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('asistidas')}
          className={`px-4 py-2 transition-colors relative ${
            activeTab === 'asistidas'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Asistidas ({asistidas.length})
          {activeTab === 'asistidas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('calendario')}
          className={`px-4 py-2 transition-colors relative ${
            activeTab === 'calendario'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Calendario
          {activeTab === 'calendario' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'asignadas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asignadas.map((capacitacion) => (
            <div
              key={capacitacion.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">{capacitacion.title}</h3>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                  Próxima
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{capacitacion.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{capacitacion.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{capacitacion.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{capacitacion.attendees} / {capacitacion.maxAttendees} inscritos</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">Instructor: {capacitacion.instructor}</p>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Ver Detalles
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'asistidas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asistidas.map((capacitacion) => (
            <div
              key={capacitacion.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">{capacitacion.title}</h3>
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{capacitacion.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{capacitacion.location}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">Instructor: {capacitacion.instructor}</p>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso</span>
                  <span>{capacitacion.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${capacitacion.progress}%` }}
                  />
                </div>
              </div>

              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Ver Certificado
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'calendario' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2;
              const hasEvent = [13, 16, 18].includes(day);
              return (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                    day > 0 && day <= 31
                      ? hasEvent
                        ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                        : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                      : 'bg-transparent'
                  }`}
                >
                  {day > 0 && day <= 31 && day}
                </div>
              );
            })}
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-gray-700">Próximos eventos:</p>
            {asignadas.slice(0, 3).map((cap) => (
              <div key={cap.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{cap.title}</p>
                  <p className="text-xs text-gray-600">{cap.date} - {cap.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
