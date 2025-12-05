'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  Plus, 
  Search, 
  GraduationCap,
  UserPlus,
  Settings,
  CalendarDays,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Award,
  XCircle
} from 'lucide-react';
import { trainingSessionApi, trainingAttendanceApi, trainingPlanApi } from '@/lib/api';
import type { TrainingSession, TrainingAttendance, TrainingPlan, PaginatedResponse } from '@/lib/api/types';
import { useAuth } from '@/lib/auth-context';

interface CapacitacionWithAttendance {
  session: TrainingSession;
  attendance?: TrainingAttendance;
}

interface UserWithGroups {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  groups: string[];
  is_active: boolean;
}

interface GroupedUsers {
  [groupName: string]: UserWithGroups[];
}

export default function CapacitacionesPage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'user' | 'admin'>('user');
  const [userTab, setUserTab] = useState<'pendientes' | 'completadas' | 'calendario'>('pendientes');
  const [adminTab, setAdminTab] = useState<'usuarios' | 'sesiones' | 'planes'>('usuarios');
  
  // User view state
  const [loading, setLoading] = useState(true);
  const [pendientes, setPendientes] = useState<CapacitacionWithAttendance[]>([]);
  const [completadas, setCompletadas] = useState<CapacitacionWithAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Admin view state
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [groupedUsers, setGroupedUsers] = useState<GroupedUsers>({});
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  
  // Form state for creating sessions
  const [sessionForm, setSessionForm] = useState({
    training_plan: 0,
    title: '',
    description: '',
    instructor_name: '',
    location: '',
    start_datetime: '',
    end_datetime: '',
    max_participants: '',
  });

  // Check if user is admin (has admin role or specific groups)
  const isAdmin = user?.is_superuser || 
                  user?.is_staff || 
                  user?.groups?.includes('Training_Managers') || 
                  user?.groups?.includes('HR_Managers');

  // Set default view based on user role
  useEffect(() => {
    if (isAdmin) {
      setActiveView('admin');
    } else {
      setActiveView('user');
    }
  }, [isAdmin]);

  // Fetch data for user view
  const fetchUserTrainings = useCallback(async () => {
    if (activeView !== 'user') return;
    
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
        
        const now = new Date();
        const pending = combinedData.filter(
          item => new Date(item.session.start_datetime) >= now && 
                 item.session.status !== 'completed' && 
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
  }, [activeView]);

  // Fetch data for admin view
  const fetchAdminData = useCallback(async () => {
    if (activeView !== 'admin') return;
    
    setLoading(true);
    try {
      // Fetch sessions
      const sessionsResponse = await trainingSessionApi.list({});
      if (sessionsResponse.data) {
        setSessions((sessionsResponse.data as PaginatedResponse<TrainingSession>).results || []);
      }

      // Fetch plans
      const plansResponse = await trainingPlanApi.list({});
      if (plansResponse.data) {
        setPlans((plansResponse.data as PaginatedResponse<TrainingPlan>).results || []);
      }

      // Fetch users (mock data for now - would need a users API endpoint)
      // In a real implementation, this would call an API to get users grouped by department/group
      fetchMockUsers();
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeView]);

  // Mock function to fetch users - replace with real API call
  const fetchMockUsers = () => {
    const mockUsers: UserWithGroups[] = [
      { id: 1, username: 'jperez', first_name: 'Juan', last_name: 'Pérez', full_name: 'Juan Pérez', email: 'juan@imcp.com', groups: ['Tecnología', 'Analistas'], is_active: true },
      { id: 2, username: 'mgarcia', first_name: 'María', last_name: 'García', full_name: 'María García', email: 'maria@imcp.com', groups: ['Tecnología'], is_active: true },
      { id: 3, username: 'clopez', first_name: 'Carlos', last_name: 'López', full_name: 'Carlos López', email: 'carlos@imcp.com', groups: ['Recursos Humanos'], is_active: true },
      { id: 4, username: 'amartinez', first_name: 'Ana', last_name: 'Martínez', full_name: 'Ana Martínez', email: 'ana@imcp.com', groups: ['Recursos Humanos', 'Gerentes'], is_active: true },
      { id: 5, username: 'rsilva', first_name: 'Roberto', last_name: 'Silva', full_name: 'Roberto Silva', email: 'roberto@imcp.com', groups: ['Administración'], is_active: true },
      { id: 6, username: 'lfernandez', first_name: 'Laura', last_name: 'Fernández', full_name: 'Laura Fernández', email: 'laura@imcp.com', groups: ['Administración', 'Analistas'], is_active: true },
    ];

    const grouped: GroupedUsers = {};
    mockUsers.forEach(user => {
      user.groups.forEach(group => {
        if (!grouped[group]) {
          grouped[group] = [];
        }
        grouped[group].push(user);
      });
    });

    setGroupedUsers(grouped);
  };

  useEffect(() => {
    if (activeView === 'user') {
      fetchUserTrainings();
    } else {
      fetchAdminData();
    }
  }, [activeView, fetchUserTrainings, fetchAdminData]);

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

  const handleConfirmAttendance = async (attendanceId: number) => {
    try {
      await trainingAttendanceApi.confirmAttendance(attendanceId);
      fetchUserTrainings();
    } catch (error) {
      console.error('Error confirming attendance:', error);
    }
  };

  const handleDeclineAttendance = async (attendanceId: number, reason: string) => {
    try {
      await trainingAttendanceApi.declineAttendance(attendanceId, reason);
      fetchUserTrainings();
    } catch (error) {
      console.error('Error declining attendance:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      const response = await trainingSessionApi.create({
        ...sessionForm,
        max_participants: sessionForm.max_participants ? Number(sessionForm.max_participants) : undefined,
      });
      
      if (response.data) {
        setIsCreateSessionDialogOpen(false);
        setSessionForm({
          training_plan: 0,
          title: '',
          description: '',
          instructor_name: '',
          location: '',
          start_datetime: '',
          end_datetime: '',
          max_participants: '',
        });
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleAssignUsers = async () => {
    if (!selectedSession || selectedUsers.length === 0) return;

    try {
      // Create attendance records for each selected user
      const promises = selectedUsers.map(userId =>
        trainingAttendanceApi.create({
          session: selectedSession.id,
          analyst: userId,
          confirmation_status: 'pending',
        })
      );

      await Promise.all(promises);
      setIsAssignDialogOpen(false);
      setSelectedUsers([]);
      setSelectedSession(null);
      fetchAdminData();
    } catch (error) {
      console.error('Error assigning users:', error);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const openAssignDialog = (session: TrainingSession) => {
    setSelectedSession(session);
    setSelectedUsers([]);
    setIsAssignDialogOpen(true);
  };

  // Get filtered users based on selected group
  const getFilteredUsers = () => {
    if (selectedGroup === 'all') {
      const allUsers = Object.values(groupedUsers).flat();
      // Remove duplicates
      return allUsers.filter((user, index, self) =>
        index === self.findIndex((u) => u.id === user.id)
      );
    }
    return groupedUsers[selectedGroup] || [];
  };

  // Filter users by search term
  const searchedUsers = getFilteredUsers().filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get all group names
  const groupNames = Object.keys(groupedUsers);

  // Render user view
  const renderUserView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          Mis Capacitaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Revisa tus cursos pendientes, completados y calendario
        </p>
      </div>

      <Tabs value={userTab} onValueChange={(v) => setUserTab(v as typeof userTab)}>
        <TabsList>
          <TabsTrigger value="pendientes">
            <Clock className="h-4 w-4 mr-2" />
            Pendientes ({pendientes.length})
          </TabsTrigger>
          <TabsTrigger value="completadas">
            <Award className="h-4 w-4 mr-2" />
            Completadas ({completadas.length})
          </TabsTrigger>
          <TabsTrigger value="calendario">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendientes.length === 0 ? (
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
                        <CalendarIcon className="h-4 w-4" />
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
                    {attendance && attendance.confirmation_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleConfirmAttendance(attendance.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            const reason = prompt('¿Por qué no puedes asistir?');
                            if (reason) handleDeclineAttendance(attendance.id, reason);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Declinar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completadas" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : completadas.length === 0 ? (
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
                        <CalendarIcon className="h-4 w-4" />
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
                    {attendance?.certificate_issued && (
                      <Button variant="outline" className="w-full">
                        <Award className="h-4 w-4 mr-2" />
                        Ver Certificado
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendario" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Capacitaciones</CardTitle>
              <CardDescription>
                Visualiza todas tus capacitaciones programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...pendientes, ...completadas]
                  .sort((a, b) => new Date(a.session.start_datetime).getTime() - new Date(b.session.start_datetime).getTime())
                  .map(({ session, attendance }) => (
                    <div key={session.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg p-3 min-w-[80px]">
                        <span className="text-2xl font-bold">
                          {new Date(session.start_datetime).getDate()}
                        </span>
                        <span className="text-xs uppercase">
                          {new Date(session.start_datetime).toLocaleDateString('es-ES', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{session.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(session.start_datetime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </span>
                        </div>
                      </div>
                      <div>
                        {session.status === 'completed' ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completada
                          </Badge>
                        ) : attendance?.confirmation_status === 'confirmed' ? (
                          <Badge variant="default">Confirmada</Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Render admin view
  const renderAdminView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Gestión de Capacitaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra capacitaciones, sesiones y asignaciones
          </p>
        </div>
        <Button onClick={() => setIsCreateSessionDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sesión
        </Button>
      </div>

      <Tabs value={adminTab} onValueChange={(v) => setAdminTab(v as typeof adminTab)}>
        <TabsList>
          <TabsTrigger value="usuarios">
            <Users className="h-4 w-4 mr-2" />
            Usuarios por Grupo
          </TabsTrigger>
          <TabsTrigger value="sesiones">
            <CalendarDays className="h-4 w-4 mr-2" />
            Sesiones ({sessions.length})
          </TabsTrigger>
          <TabsTrigger value="planes">
            <GraduationCap className="h-4 w-4 mr-2" />
            Planes ({plans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                {groupNames.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedGroup === 'all' ? 'Todos los Usuarios' : `Grupo: ${selectedGroup}`}
              </CardTitle>
              <CardDescription>
                {searchedUsers.length} usuario(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Grupos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.groups.map(group => (
                            <Badge key={group} variant="outline" className="text-xs">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Open dialog to assign user to a session
                            // For now, just log
                            console.log('Assign training to user:', user.id);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Asignar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sesiones" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sesiones de Capacitación</CardTitle>
              <CardDescription>
                Gestiona las sesiones programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay sesiones programadas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sesión</TableHead>
                      <TableHead>Fecha/Hora</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Participantes</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-xs text-muted-foreground">{session.instructor_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDateTime(session.start_datetime)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {session.confirmed_count}/{session.max_participants || '∞'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            session.status === 'completed' ? 'default' :
                            session.status === 'confirmed' ? 'default' :
                            session.status === 'cancelled' ? 'destructive' :
                            'secondary'
                          }>
                            {session.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon-sm"
                              onClick={() => openAssignDialog(session)}
                              title="Asignar usuarios"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Planes de Capacitación</CardTitle>
              <CardDescription>
                Gestiona los planes de capacitación
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay planes de capacitación</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{plan.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {plan.duration_hours}h • {plan.modality}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Badge variant={
                            plan.status === 'completed' ? 'default' :
                            plan.status === 'in_progress' ? 'default' :
                            plan.status === 'cancelled' ? 'destructive' :
                            'secondary'
                          }>
                            {plan.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            Sesiones: {plan.session_count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Session Dialog */}
      <Dialog open={isCreateSessionDialogOpen} onOpenChange={setIsCreateSessionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nueva Sesión de Capacitación</DialogTitle>
            <DialogDescription>
              Crea una nueva sesión y asigna participantes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan de Capacitación</label>
              <Select
                value={sessionForm.training_plan ? sessionForm.training_plan.toString() : ''}
                onValueChange={(v) => setSessionForm({ ...sessionForm, training_plan: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                placeholder="Nombre de la sesión"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructor</label>
                <Input
                  value={sessionForm.instructor_name}
                  onChange={(e) => setSessionForm({ ...sessionForm, instructor_name: e.target.value })}
                  placeholder="Nombre del instructor"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ubicación</label>
                <Input
                  value={sessionForm.location}
                  onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                  placeholder="Sala o ubicación"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha/Hora Inicio</label>
                <Input
                  type="datetime-local"
                  value={sessionForm.start_datetime}
                  onChange={(e) => setSessionForm({ ...sessionForm, start_datetime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha/Hora Fin</label>
                <Input
                  type="datetime-local"
                  value={sessionForm.end_datetime}
                  onChange={(e) => setSessionForm({ ...sessionForm, end_datetime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                placeholder="Descripción de la sesión..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSessionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSession}>Crear Sesión</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Users Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Asignar Usuarios a Sesión</DialogTitle>
            <DialogDescription>
              {selectedSession?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[400px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {Object.entries(groupedUsers).map(([group, users]) => (
              <div key={group}>
                <h3 className="font-semibold text-sm mb-2">{group}</h3>
                <div className="space-y-1">
                  {users
                    .filter(user =>
                      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer"
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="h-4 w-4"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignUsers} disabled={selectedUsers.length === 0}>
              Asignar {selectedUsers.length} Usuario(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Toggle for Admin */}
      {isAdmin && (
        <div className="flex justify-end">
          <div className="inline-flex rounded-lg border border-border p-1">
            <button
              onClick={() => setActiveView('user')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Vista de Usuario
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'admin'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Vista de Administrador
            </button>
          </div>
        </div>
      )}

      {activeView === 'user' ? renderUserView() : renderAdminView()}
    </div>
  );
}
