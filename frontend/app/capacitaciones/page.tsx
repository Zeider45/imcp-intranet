'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, CheckCircle, Plus, Search, GraduationCap } from 'lucide-react';
import { trainingSessionApi, trainingAttendanceApi } from '@/lib/api';
import type { TrainingSession, TrainingAttendance } from '@/lib/api/types';

interface CapacitacionWithAttendance {
  session: TrainingSession;
  attendance?: TrainingAttendance;
}

interface EmployeeByDepartment {
  id: number;
  name: string;
  department: string;
  email: string;
  assigned: boolean;
}

// TODO: Replace with actual API call to fetch employees
// This mock data is for development/demonstration purposes only
const MOCK_EMPLOYEES_BY_DEPT: { [key: string]: EmployeeByDepartment[] } = {
  'Tecnología': [
    { id: 1, name: 'Juan Pérez', department: 'Tecnología', email: 'juan@imcp.com', assigned: true },
    { id: 2, name: 'María García', department: 'Tecnología', email: 'maria@imcp.com', assigned: false },
  ],
  'Recursos Humanos': [
    { id: 3, name: 'Carlos López', department: 'Recursos Humanos', email: 'carlos@imcp.com', assigned: true },
    { id: 4, name: 'Ana Martínez', department: 'Recursos Humanos', email: 'ana@imcp.com', assigned: false },
  ],
  'Administración': [
    { id: 5, name: 'Roberto Silva', department: 'Administración', email: 'roberto@imcp.com', assigned: false },
    { id: 6, name: 'Laura Fernández', department: 'Administración', email: 'laura@imcp.com', assigned: true },
  ],
};

export default function CapacitacionesPage() {
  const [activeTab, setActiveTab] = useState<'pendientes' | 'completadas'>('pendientes');
  const [loading, setLoading] = useState(true);
  const [pendientes, setPendientes] = useState<CapacitacionWithAttendance[]>([]);
  const [completadas, setCompletadas] = useState<CapacitacionWithAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // TODO: Replace with actual auth context check for admin role
  // Example: const { user } = useAuth(); const isAdmin = user?.role === 'admin';
  // DEVELOPMENT ONLY: Set to false for client view, true for admin view during development
  const isAdmin = false;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const attendancesResponse = await trainingAttendanceApi.myInvitations();
        
        if (attendancesResponse.data) {
          const attendances = attendancesResponse.data;
          
          const sessionPromises = attendances.map(attendance => 
            trainingSessionApi.get(attendance.session)
          );
          
          const sessionsResponses = await Promise.all(sessionPromises);
          
          const combinedData = sessionsResponses
            .map((response, index) => {
              if (!response.data) return null;
              return {
                session: response.data,
                attendance: attendances[index],
              } as CapacitacionWithAttendance;
            })
            .filter((item): item is CapacitacionWithAttendance => item !== null);
          
          const pending = combinedData.filter(
            item => item.session.status !== 'completed' && 
                   item.attendance?.confirmation_status !== 'declined'
          );
          
          const completed = combinedData.filter(
            item => item.session.status === 'completed' ||
                   item.attendance?.attendance_status === 'present'
          );
          
          setPendientes(pending);
          setCompletadas(completed);
        }
      } catch (error) {
        console.error('Error fetching training data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Admin View - Employee Management by Department
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de Capacitaciones
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra las capacitaciones y asignaciones de empleados
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Capacitación
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar empleados..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Employees by Department */}
        <div className="space-y-4">
          {Object.entries(MOCK_EMPLOYEES_BY_DEPT).map(([department, employees]) => (
            <Card key={department}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{department}</span>
                  <Badge variant="secondary">{employees.length} empleados</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employees
                    .filter(emp => 
                      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{employee.name}</p>
                            <p className="text-sm text-muted-foreground">{employee.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {employee.assigned && (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Asignado
                            </Badge>
                          )}
                          <Button size="sm" variant={employee.assigned ? "outline" : "default"}>
                            {employee.assigned ? 'Gestionar' : 'Asignar'}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Client View - Pending and Completed Courses
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Mis Capacitaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Revisa tus cursos pendientes y completados
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'pendientes'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Cursos Pendientes ({pendientes.length})
          {activeTab === 'pendientes' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('completadas')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'completadas'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Cursos Completados ({completadas.length})
          {activeTab === 'completadas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Cargando capacitaciones...</p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'pendientes' && (
            pendientes.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      No tienes cursos pendientes en este momento.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendientes.map(({ session, attendance }) => (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <Badge variant={attendance?.confirmation_status === 'confirmed' ? 'default' : 'secondary'}>
                          {attendance?.confirmation_status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(session.start_datetime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(session.start_datetime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Instructor: {session.instructor_name}</span>
                        </div>
                      </div>
                      <Button className="w-full">Ver Detalles</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {activeTab === 'completadas' && (
            completadas.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      No has completado ningún curso aún.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completadas.map(({ session, attendance }) => (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CheckCircle className="h-6 w-6 text-chart-3" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(session.start_datetime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Instructor: {session.instructor_name}</span>
                        </div>
                      </div>
                      {attendance?.evaluation_score && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Calificación</span>
                            <span className="font-semibold text-foreground">{attendance.evaluation_score}/100</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-chart-3 h-2 rounded-full transition-all"
                              style={{ width: `${attendance.evaluation_score}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <Button variant="outline" className="w-full">Ver Certificado</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
