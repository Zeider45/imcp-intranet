'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  CalendarDays, 
  Plus, 
  Search, 
  FileText, 
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Users,
  Play,
  Check
} from 'lucide-react';
import { trainingSessionApi, trainingPlanApi } from '@/lib/api';
import type { TrainingSession, TrainingPlan, PaginatedResponse } from '@/lib/api/types';

const statusLabels: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  scheduled: 'outline',
  confirmed: 'secondary',
  in_progress: 'default',
  completed: 'default',
  cancelled: 'destructive',
};

const statusIcons: Record<string, React.ReactNode> = {
  scheduled: <Clock className="h-3 w-3" />,
  confirmed: <CheckCircle className="h-3 w-3" />,
  in_progress: <Play className="h-3 w-3" />,
  completed: <Check className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

export default function TrainingSessionsPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [formData, setFormData] = useState({
    training_plan: 0,
    title: '',
    description: '',
    instructor_name: '',
    location: '',
    start_datetime: '',
    end_datetime: '',
    max_participants: '',
    confirmation_deadline: '',
    materials_required: '',
    objectives: '',
  });

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (filterStatus !== 'all') params.status = filterStatus;

    const response = await trainingSessionApi.list(params);
    if (response.data) {
      setSessions((response.data as PaginatedResponse<TrainingSession>).results || []);
    }
    setLoading(false);
  }, [searchTerm, filterStatus]);

  const fetchPlans = useCallback(async () => {
    const response = await trainingPlanApi.list({ status: 'approved' });
    if (response.data) {
      setPlans((response.data as PaginatedResponse<TrainingPlan>).results || []);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchPlans();
  }, [fetchSessions, fetchPlans]);

  const handleCreate = async () => {
    const response = await trainingSessionApi.create({
      ...formData,
      max_participants: formData.max_participants ? Number(formData.max_participants) : undefined,
    });
    if (response.data) {
      setIsCreateDialogOpen(false);
      resetForm();
      fetchSessions();
    }
  };

  const handleConfirm = async (id: number) => {
    const response = await trainingSessionApi.confirm(id);
    if (response.data) {
      fetchSessions();
    }
  };

  const handleComplete = async (id: number) => {
    if (confirm('¿Está seguro de marcar esta sesión como completada?')) {
      const response = await trainingSessionApi.complete(id);
      if (response.data) {
        fetchSessions();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      training_plan: 0,
      title: '',
      description: '',
      instructor_name: '',
      location: '',
      start_datetime: '',
      end_datetime: '',
      max_participants: '',
      confirmation_deadline: '',
      materials_required: '',
      objectives: '',
    });
  };

  const openViewDialog = (session: TrainingSession) => {
    setSelectedSession(session);
    setIsViewDialogOpen(true);
  };

  const scheduledCount = sessions.filter(s => s.status === 'scheduled').length;
  const confirmedCount = sessions.filter(s => s.status === 'confirmed').length;
  const completedCount = sessions.filter(s => s.status === 'completed').length;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            Sesiones de Capacitación
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de sesiones y asistencia a capacitaciones
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sesión
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Programadas</p>
                <p className="text-2xl font-bold">{scheduledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold">{confirmedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <CalendarDays className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, instructor o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchSessions}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sesiones de Capacitación</CardTitle>
          <CardDescription>
            {sessions.length} sesión(es) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron sesiones de capacitación</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sesión</TableHead>
                  <TableHead>Instructor</TableHead>
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
                        <p className="font-medium truncate max-w-[200px]">{session.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {session.training_plan_title}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{session.instructor_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDateTime(session.start_datetime)}</p>
                        <p className="text-xs text-muted-foreground">
                          hasta {formatDateTime(session.end_datetime)}
                        </p>
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
                      <Badge variant={statusColors[session.status]} className="gap-1">
                        {statusIcons[session.status]}
                        {statusLabels[session.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openViewDialog(session)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {session.status === 'scheduled' && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleConfirm(session.id)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Confirmar Sesión"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {(session.status === 'confirmed' || session.status === 'in_progress') && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleComplete(session.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Marcar Completada"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Sesión de Capacitación</DialogTitle>
            <DialogDescription>
              Programe una nueva sesión de capacitación
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan de Capacitación *</label>
              <Select 
                value={formData.training_plan ? formData.training_plan.toString() : ''} 
                onValueChange={(v) => setFormData({ ...formData, training_plan: parseInt(v) })}
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
              <label className="text-sm font-medium">Título de la Sesión *</label>
              <Input
                placeholder="Sesión 1: Introducción"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructor *</label>
                <Input
                  placeholder="Nombre del instructor"
                  value={formData.instructor_name}
                  onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ubicación *</label>
                <Input
                  placeholder="Sala de capacitación A"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha y Hora de Inicio *</label>
                <Input
                  type="datetime-local"
                  value={formData.start_datetime}
                  onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha y Hora de Fin *</label>
                <Input
                  type="datetime-local"
                  value={formData.end_datetime}
                  onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Máximo de Participantes</label>
                <Input
                  type="number"
                  placeholder="20"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Límite de Confirmación</label>
                <Input
                  type="date"
                  value={formData.confirmation_deadline}
                  onChange={(e) => setFormData({ ...formData, confirmation_deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                placeholder="Descripción de la sesión..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Objetivos</label>
              <Textarea
                placeholder="Objetivos de la sesión..."
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Materiales Requeridos</label>
              <Textarea
                placeholder="Lista de materiales que los participantes deben traer..."
                value={formData.materials_required}
                onChange={(e) => setFormData({ ...formData, materials_required: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear Sesión</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {selectedSession?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedSession?.training_plan_title}
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <p>
                    <Badge variant={statusColors[selectedSession.status]} className="gap-1">
                      {statusIcons[selectedSession.status]}
                      {statusLabels[selectedSession.status]}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Instructor</span>
                  <p className="font-medium">{selectedSession.instructor_name}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Fecha y Hora</span>
                <div className="mt-1 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDateTime(selectedSession.start_datetime)}</span>
                  <span className="text-muted-foreground">-</span>
                  <span>{formatDateTime(selectedSession.end_datetime)}</span>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Ubicación</span>
                <p className="font-medium flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {selectedSession.location}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Participantes</span>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedSession.confirmed_count} confirmados
                    {selectedSession.max_participants && ` / ${selectedSession.max_participants} máx.`}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Asistentes Totales</span>
                  <p className="font-medium">{selectedSession.attendance_count}</p>
                </div>
              </div>
              
              {selectedSession.confirmation_deadline && (
                <div>
                  <span className="text-sm text-muted-foreground">Fecha Límite de Confirmación</span>
                  <p className="font-medium">
                    {new Date(selectedSession.confirmation_deadline).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              
              {selectedSession.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Descripción</span>
                  <p className="text-sm mt-1">{selectedSession.description}</p>
                </div>
              )}
              
              {selectedSession.objectives && (
                <div>
                  <span className="text-sm text-muted-foreground">Objetivos</span>
                  <p className="text-sm mt-1">{selectedSession.objectives}</p>
                </div>
              )}
              
              {selectedSession.materials_required && (
                <div>
                  <span className="text-sm text-muted-foreground">Materiales Requeridos</span>
                  <p className="text-sm mt-1">{selectedSession.materials_required}</p>
                </div>
              )}
              
              {selectedSession.provider_name && (
                <div>
                  <span className="text-sm text-muted-foreground">Proveedor</span>
                  <p className="font-medium">{selectedSession.provider_name}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
