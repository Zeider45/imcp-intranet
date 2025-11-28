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
  GraduationCap, 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import { trainingPlanApi } from '@/lib/api';
import type { TrainingPlan, PaginatedResponse } from '@/lib/api/types';

const statusLabels: Record<string, string> = {
  planning: 'En Planificación',
  budget_review: 'Revisión Presupuesto',
  quotation: 'En Cotización',
  approved: 'Aprobado',
  scheduled: 'Programado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planning: 'outline',
  budget_review: 'secondary',
  quotation: 'secondary',
  approved: 'default',
  scheduled: 'default',
  in_progress: 'default',
  completed: 'default',
  cancelled: 'destructive',
};

const originLabels: Record<string, string> = {
  performance: 'Evaluación de Desempeño',
  new_technology: 'Nueva Tecnología',
  regulation: 'Actualización Normativa',
  audit: 'Resultado de Auditoría',
  other: 'Otro',
};

const scopeLabels: Record<string, string> = {
  intergerencial: 'Intergerencial',
  interdepartamental: 'Interdepartamental',
};

const modalityLabels: Record<string, string> = {
  presential: 'Presencial',
  online: 'En Línea',
  hybrid: 'Híbrido',
};

export default function TrainingPlansPage() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    topics: string;
    origin: 'performance' | 'new_technology' | 'regulation' | 'audit' | 'other';
    scope: 'intergerencial' | 'interdepartamental';
    modality: 'presential' | 'online' | 'hybrid';
    duration_hours: number;
    instructor_profile: string;
    budget_amount: string;
    planned_start_date: string;
    planned_end_date: string;
  }>({
    title: '',
    description: '',
    topics: '',
    origin: 'new_technology',
    scope: 'interdepartamental',
    modality: 'presential',
    duration_hours: 8,
    instructor_profile: '',
    budget_amount: '',
    planned_start_date: '',
    planned_end_date: '',
  });

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (filterStatus !== 'all') params.status = filterStatus;

    const response = await trainingPlanApi.list(params);
    if (response.data) {
      setPlans((response.data as PaginatedResponse<TrainingPlan>).results || []);
    }
    setLoading(false);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreate = async () => {
    const response = await trainingPlanApi.create({
      ...formData,
      duration_hours: Number(formData.duration_hours),
      budget_amount: formData.budget_amount ? Number(formData.budget_amount) : undefined,
    });
    if (response.data) {
      setIsCreateDialogOpen(false);
      resetForm();
      fetchPlans();
    }
  };

  const handleUpdate = async () => {
    if (!selectedPlan) return;
    const response = await trainingPlanApi.update(selectedPlan.id, {
      ...formData,
      duration_hours: Number(formData.duration_hours),
      budget_amount: formData.budget_amount ? Number(formData.budget_amount) : undefined,
    });
    if (response.data) {
      setIsEditDialogOpen(false);
      resetForm();
      fetchPlans();
    }
  };

  const handleApproveBudget = async (id: number) => {
    if (confirm('¿Está seguro de aprobar el presupuesto para este plan de capacitación?')) {
      const response = await trainingPlanApi.approveBudget(id);
      if (response.data) {
        fetchPlans();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este plan de capacitación?')) {
      await trainingPlanApi.delete(id);
      fetchPlans();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      topics: '',
      origin: 'new_technology',
      scope: 'interdepartamental',
      modality: 'presential',
      duration_hours: 8,
      instructor_profile: '',
      budget_amount: '',
      planned_start_date: '',
      planned_end_date: '',
    });
    setSelectedPlan(null);
  };

  const openEditDialog = (plan: TrainingPlan) => {
    setSelectedPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      topics: plan.topics,
      origin: plan.origin,
      scope: plan.scope,
      modality: plan.modality,
      duration_hours: plan.duration_hours,
      instructor_profile: plan.instructor_profile,
      budget_amount: plan.budget_amount?.toString() || '',
      planned_start_date: plan.planned_start_date || '',
      planned_end_date: plan.planned_end_date || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (plan: TrainingPlan) => {
    setSelectedPlan(plan);
    setIsViewDialogOpen(true);
  };

  const planningCount = plans.filter(p => ['planning', 'budget_review', 'quotation'].includes(p.status)).length;
  const activeCount = plans.filter(p => ['approved', 'scheduled', 'in_progress'].includes(p.status)).length;
  const completedCount = plans.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Planes de Capacitación
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema para planificar y gestionar capacitaciones técnicas
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Plan
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
                <p className="text-sm text-muted-foreground">En Planificación</p>
                <p className="text-2xl font-bold">{planningCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{plans.length}</p>
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
                placeholder="Buscar por título o temas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchPlans}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Planes de Capacitación</CardTitle>
          <CardDescription>
            {plans.length} plan(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron planes de capacitación</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Modalidad</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{plan.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {originLabels[plan.origin] || plan.origin}
                      </Badge>
                    </TableCell>
                    <TableCell>{modalityLabels[plan.modality]}</TableCell>
                    <TableCell>{plan.duration_hours}h</TableCell>
                    <TableCell>
                      {plan.budget_amount ? (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {plan.budget_amount.toLocaleString()}
                          {plan.budget_approved && (
                            <CheckCircle className="h-3 w-3 text-green-600 ml-1" />
                          )}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[plan.status]}>
                        {statusLabels[plan.status] || plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openViewDialog(plan)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {plan.status === 'planning' && (
                          <>
                            <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(plan)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => handleDelete(plan.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {plan.status === 'budget_review' && !plan.budget_approved && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleApproveBudget(plan.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Aprobar Presupuesto"
                          >
                            <DollarSign className="h-4 w-4" />
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
            <DialogTitle>Nuevo Plan de Capacitación</DialogTitle>
            <DialogDescription>
              Cree un nuevo plan de capacitación técnica
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Capacitación en Nuevas Tecnologías"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Origen</label>
                <Select 
                  value={formData.origin} 
                  onValueChange={(v) => setFormData({ ...formData, origin: v as typeof formData.origin })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(originLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alcance</label>
                <Select 
                  value={formData.scope} 
                  onValueChange={(v) => setFormData({ ...formData, scope: v as typeof formData.scope })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(scopeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Modalidad</label>
                <Select 
                  value={formData.modality} 
                  onValueChange={(v) => setFormData({ ...formData, modality: v as typeof formData.modality })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(modalityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duración (horas) *</label>
                <Input
                  type="number"
                  placeholder="8"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Presupuesto Estimado</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.budget_amount}
                  onChange={(e) => setFormData({ ...formData, budget_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Inicio Planificada</label>
                <Input
                  type="date"
                  value={formData.planned_start_date}
                  onChange={(e) => setFormData({ ...formData, planned_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Fin Planificada</label>
                <Input
                  type="date"
                  value={formData.planned_end_date}
                  onChange={(e) => setFormData({ ...formData, planned_end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción/Objetivo *</label>
              <Textarea
                placeholder="Descripción del plan de capacitación..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Temas a Cubrir *</label>
              <Textarea
                placeholder="Lista de temas que se cubrirán..."
                value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Perfil del Instructor Requerido</label>
              <Textarea
                placeholder="Experiencia y conocimientos requeridos del instructor..."
                value={formData.instructor_profile}
                onChange={(e) => setFormData({ ...formData, instructor_profile: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plan de Capacitación</DialogTitle>
            <DialogDescription>
              Actualice la información del plan
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Capacitación en Nuevas Tecnologías"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Origen</label>
                <Select 
                  value={formData.origin} 
                  onValueChange={(v) => setFormData({ ...formData, origin: v as typeof formData.origin })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(originLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alcance</label>
                <Select 
                  value={formData.scope} 
                  onValueChange={(v) => setFormData({ ...formData, scope: v as typeof formData.scope })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(scopeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Modalidad</label>
                <Select 
                  value={formData.modality} 
                  onValueChange={(v) => setFormData({ ...formData, modality: v as typeof formData.modality })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(modalityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duración (horas) *</label>
                <Input
                  type="number"
                  placeholder="8"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Presupuesto Estimado</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.budget_amount}
                  onChange={(e) => setFormData({ ...formData, budget_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción/Objetivo *</label>
              <Textarea
                placeholder="Descripción del plan de capacitación..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Temas a Cubrir *</label>
              <Textarea
                placeholder="Lista de temas que se cubrirán..."
                value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {selectedPlan?.title}
            </DialogTitle>
            <DialogDescription>
              Plan de Capacitación
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <p>
                    <Badge variant={statusColors[selectedPlan.status]}>
                      {statusLabels[selectedPlan.status]}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Origen</span>
                  <p>
                    <Badge variant="outline">
                      {originLabels[selectedPlan.origin]}
                    </Badge>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Alcance</span>
                  <p className="font-medium">{scopeLabels[selectedPlan.scope]}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Modalidad</span>
                  <p className="font-medium">{modalityLabels[selectedPlan.modality]}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Duración</span>
                  <p className="font-medium">{selectedPlan.duration_hours} horas</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Presupuesto</span>
                  <p className="font-medium flex items-center gap-1">
                    {selectedPlan.budget_amount ? (
                      <>
                        <DollarSign className="h-4 w-4" />
                        {selectedPlan.budget_amount.toLocaleString()}
                        {selectedPlan.budget_approved && (
                          <Badge variant="default" className="ml-2 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Aprobado
                          </Badge>
                        )}
                      </>
                    ) : 'No definido'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Gerente Asignado</span>
                  <p className="font-medium">{selectedPlan.assigned_manager_name || 'No asignado'}</p>
                </div>
              </div>
              
              {(selectedPlan.planned_start_date || selectedPlan.planned_end_date) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Fecha Inicio</span>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {selectedPlan.planned_start_date 
                        ? new Date(selectedPlan.planned_start_date).toLocaleDateString('es-ES')
                        : '-'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Fecha Fin</span>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {selectedPlan.planned_end_date 
                        ? new Date(selectedPlan.planned_end_date).toLocaleDateString('es-ES')
                        : '-'
                      }
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <span className="text-sm text-muted-foreground">Descripción/Objetivo</span>
                <p className="text-sm mt-1">{selectedPlan.description}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Temas a Cubrir</span>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{selectedPlan.topics}</pre>
                </div>
              </div>
              
              {selectedPlan.instructor_profile && (
                <div>
                  <span className="text-sm text-muted-foreground">Perfil del Instructor</span>
                  <p className="text-sm mt-1">{selectedPlan.instructor_profile}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Sesiones</span>
                  <p className="font-medium">{selectedPlan.session_count || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Cotizaciones</span>
                  <p className="font-medium">{selectedPlan.quotation_count || 0}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  Creado: {new Date(selectedPlan.created_at).toLocaleDateString('es-ES')}
                </div>
                <div>
                  Por: {selectedPlan.created_by_name}
                </div>
              </div>
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
