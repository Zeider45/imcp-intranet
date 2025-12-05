'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, CheckCircle, Plus, Search } from 'lucide-react';
import { trainingSessionApi, trainingAttendanceApi } from '@/lib/api';
import type { TrainingSession, TrainingAttendance } from '@/lib/api/types';

interface CapacitacionWithAttendance {
  session: TrainingSession;
  attendance?: TrainingAttendance;
}

export default function CapacitacionesPage() {
  const [activeTab, setActiveTab] = useState<'asignadas' | 'asistidas' | 'calendario'>('asignadas');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [asignadas, setAsignadas] = useState<CapacitacionWithAttendance[]>([]);
  const [asistidas, setAsistidas] = useState<CapacitacionWithAttendance[]>([]);
  const isAdmin = true; // TODO: Get from auth context

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch my invitations/attendances
        const attendancesResponse = await trainingAttendanceApi.myInvitations();
        
        if (attendancesResponse.data) {
          const attendances = attendancesResponse.data;
          
          // Fetch sessions for each attendance
          const sessionPromises = attendances.map(attendance => 
            trainingSessionApi.get(attendance.session)
          );
          
          const sessionsResponses = await Promise.all(sessionPromises);
          
          // Combine sessions with attendance data
          const combinedData: CapacitacionWithAttendance[] = sessionsResponses
            .map((response, index) => ({
              session: response.data!,
              attendance: attendances[index],
            }))
            .filter(item => item.session);
          
          // Split into assigned (upcoming) and attended (completed)
          const assigned = combinedData.filter(
            item => item.session.status !== 'completed' && 
                   item.attendance?.confirmation_status !== 'declined'
          );
          
          const attended = combinedData.filter(
            item => item.session.status === 'completed' ||
                   item.attendance?.attendance_status === 'present'
          );
          
          setAsignadas(assigned);
          setAsistidas(attended);
        }
      } catch (error) {
        console.error('Error fetching training data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          ) : asignadas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No tienes capacitaciones asignadas en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {asignadas.map(({ session, attendance }) => (
                <div
                  key={session.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{session.title}</h3>
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                      {attendance?.confirmation_status === 'confirmed' ? 'Confirmada' : 'Próxima'}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(session.start_datetime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(session.start_datetime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{session.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{session.confirmed_count} / {session.max_participants || 'Sin límite'} confirmados</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">Instructor: {session.instructor_name}</p>

                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Ver Detalles
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'asistidas' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          ) : asistidas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No has asistido a ninguna capacitación aún.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {asistidas.map(({ session, attendance }) => (
                <div
                  key={session.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{session.title}</h3>
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(session.start_datetime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{session.location}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">Instructor: {session.instructor_name}</p>

                  {attendance?.evaluation_score && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Calificación</span>
                        <span>{attendance.evaluation_score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${attendance.evaluation_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={!attendance?.certificate_issued}
                  >
                    {attendance?.certificate_issued ? 'Ver Certificado' : 'Certificado no disponible'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'calendario' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          ) : (
            <>
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
                  // Check if any training is on this day
                  const hasEvent = asignadas.some(({ session }) => {
                    const sessionDate = new Date(session.start_datetime);
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    return sessionDate.getDate() === day && 
                           sessionDate.getMonth() === currentMonth &&
                           sessionDate.getFullYear() === currentYear;
                  });
                  
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
                {asignadas.length === 0 ? (
                  <p className="text-sm text-gray-600">No hay eventos próximos programados.</p>
                ) : (
                  asignadas.slice(0, 3).map(({ session }) => (
                    <div key={session.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{session.title}</p>
                        <p className="text-xs text-gray-600">{formatDateTime(session.start_datetime)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
