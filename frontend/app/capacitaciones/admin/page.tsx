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
  MapPin, 
  Users, 
  Plus, 
  Search, 
  GraduationCap,
  UserPlus,
  Settings,
  CalendarDays,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { trainingSessionApi, trainingAttendanceApi, trainingPlanApi } from '@/lib/api';
import type { TrainingSession, TrainingPlan, PaginatedResponse } from '@/lib/api/types';
import { useAuth } from '@/lib/auth-context';

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

export default function CapacitacionesAdminPage() {
  const { user } = useAuth();
  const [adminTab, setAdminTab] = useState<'usuarios' | 'sesiones' | 'planes'>('usuarios');
  
  // Admin view state
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [groupedUsers, setGroupedUsers] = useState<GroupedUsers>({});
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] = useState(false);
  const [isAssignSingleUserDialogOpen, setIsAssignSingleUserDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedSingleUser, setSelectedSingleUser] = useState<UserWithGroups | null>(null);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Fetch data for admin view
  const fetchAdminData = useCallback(async () => {
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
  }, []);

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
    fetchAdminData();
  }, [fetchAdminData]);

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

  const openAssignSingleUserDialog = (user: UserWithGroups) => {
    setSelectedSingleUser(user);
    setSelectedSessionId(0);
    setIsAssignSingleUserDialogOpen(true);
  };

  const handleAssignSingleUser = async () => {
    if (!selectedSingleUser || !selectedSessionId) return;

    try {
      await trainingAttendanceApi.create({
        session: selectedSessionId,
        analyst: selectedSingleUser.id,
        confirmation_status: 'pending',
      });
      setIsAssignSingleUserDialogOpen(false);
      setSelectedSingleUser(null);
      setSelectedSessionId(0);
      fetchAdminData();
    } catch (error) {
      console.error('Error assigning user to session:', error);
    }
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

  return (
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
                          onClick={() => openAssignSingleUserDialog(user)}
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

      {/* Assign Single User to Session Dialog */}
      <Dialog open={isAssignSingleUserDialogOpen} onOpenChange={setIsAssignSingleUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Asignar Capacitación</DialogTitle>
            <DialogDescription>
              Asignar una sesión de capacitación a {selectedSingleUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar Sesión</label>
              <Select
                value={selectedSessionId ? selectedSessionId.toString() : ''}
                onValueChange={(v) => setSelectedSessionId(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una sesión" />
                </SelectTrigger>
                <SelectContent>
                  {sessions
                    .filter(s => s.status !== 'completed' && s.status !== 'cancelled')
                    .map((session) => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        <div className="flex flex-col">
                          <span>{session.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(session.start_datetime)} - {session.location}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignSingleUserDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssignSingleUser} 
              disabled={!selectedSessionId}
            >
              Asignar Sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
