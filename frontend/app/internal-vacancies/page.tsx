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
  Briefcase, 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  Globe,
  Users,
  DollarSign,
  Calendar,
  UserPlus
} from 'lucide-react';
import { internalVacancyApi, departmentApi } from '@/lib/api';
import type { InternalVacancy, Department, PaginatedResponse } from '@/lib/api/types';

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  pending_approval: 'Pendiente Aprobación',
  published: 'Publicada',
  closed: 'Cerrada',
  filled: 'Cubierta',
  cancelled: 'Cancelada',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  pending_approval: 'secondary',
  published: 'default',
  closed: 'secondary',
  filled: 'default',
  cancelled: 'destructive',
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Edit className="h-3 w-3" />,
  pending_approval: <Clock className="h-3 w-3" />,
  published: <Globe className="h-3 w-3" />,
  closed: <Clock className="h-3 w-3" />,
  filled: <CheckCircle className="h-3 w-3" />,
  cancelled: <Clock className="h-3 w-3" />,
};

export default function InternalVacanciesPage() {
  const [vacancies, setVacancies] = useState<InternalVacancy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<InternalVacancy | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    department: 0,
    description: '',
    responsibilities: '',
    technical_requirements: '',
    competencies: '',
    experience_required: '',
    specific_knowledge: '',
    salary_range_min: '',
    salary_range_max: '',
    authorization_justification: '',
    required_date: '',
    application_deadline: '',
  });

  const fetchVacancies = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (filterStatus !== 'all') params.status = filterStatus;

    const response = await internalVacancyApi.list(params);
    if (response.data) {
      setVacancies((response.data as PaginatedResponse<InternalVacancy>).results || []);
    }
    setLoading(false);
  }, [searchTerm, filterStatus]);

  const fetchDepartments = useCallback(async () => {
    const response = await departmentApi.list();
    if (response.data) {
      setDepartments((response.data as PaginatedResponse<Department>).results || []);
    }
  }, []);

  useEffect(() => {
    fetchVacancies();
    fetchDepartments();
  }, [fetchVacancies, fetchDepartments]);

  const handleCreate = async () => {
    const response = await internalVacancyApi.create({
      ...formData,
      salary_range_min: formData.salary_range_min ? Number(formData.salary_range_min) : undefined,
      salary_range_max: formData.salary_range_max ? Number(formData.salary_range_max) : undefined,
    });
    if (response.data) {
      setIsCreateDialogOpen(false);
      resetForm();
      fetchVacancies();
    }
  };

  const handleUpdate = async () => {
    if (!selectedVacancy) return;
    const response = await internalVacancyApi.update(selectedVacancy.id, {
      ...formData,
      salary_range_min: formData.salary_range_min ? Number(formData.salary_range_min) : undefined,
      salary_range_max: formData.salary_range_max ? Number(formData.salary_range_max) : undefined,
    });
    if (response.data) {
      setIsEditDialogOpen(false);
      resetForm();
      fetchVacancies();
    }
  };

  const handleApproveBudget = async (id: number) => {
    if (confirm('¿Está seguro de aprobar el presupuesto para esta vacante?')) {
      const response = await internalVacancyApi.approveBudget(id);
      if (response.data) {
        fetchVacancies();
      }
    }
  };

  const handlePublish = async (id: number) => {
    if (confirm('¿Está seguro de publicar esta vacante?')) {
      const response = await internalVacancyApi.publish(id);
      if (response.data) {
        fetchVacancies();
      }
    }
  };

  const handleClose = async (id: number) => {
    if (confirm('¿Está seguro de cerrar esta vacante?')) {
      const response = await internalVacancyApi.close(id);
      if (response.data) {
        fetchVacancies();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta vacante?')) {
      await internalVacancyApi.delete(id);
      fetchVacancies();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: 0,
      description: '',
      responsibilities: '',
      technical_requirements: '',
      competencies: '',
      experience_required: '',
      specific_knowledge: '',
      salary_range_min: '',
      salary_range_max: '',
      authorization_justification: '',
      required_date: '',
      application_deadline: '',
    });
    setSelectedVacancy(null);
  };

  const openEditDialog = (vacancy: InternalVacancy) => {
    setSelectedVacancy(vacancy);
    setFormData({
      title: vacancy.title,
      department: vacancy.department,
      description: vacancy.description,
      responsibilities: vacancy.responsibilities,
      technical_requirements: vacancy.technical_requirements,
      competencies: vacancy.competencies,
      experience_required: vacancy.experience_required,
      specific_knowledge: vacancy.specific_knowledge,
      salary_range_min: vacancy.salary_range_min?.toString() || '',
      salary_range_max: vacancy.salary_range_max?.toString() || '',
      authorization_justification: vacancy.authorization_justification,
      required_date: vacancy.required_date || '',
      application_deadline: vacancy.application_deadline || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (vacancy: InternalVacancy) => {
    setSelectedVacancy(vacancy);
    setIsViewDialogOpen(true);
  };

  const draftCount = vacancies.filter(v => v.status === 'draft').length;
  const publishedCount = vacancies.filter(v => v.status === 'published').length;
  const filledCount = vacancies.filter(v => v.status === 'filled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            Vacantes Internas
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de gestión de vacantes y postulaciones internas
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Vacante
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Edit className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Borradores</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publicadas</p>
                <p className="text-2xl font-bold">{publishedCount}</p>
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
                <p className="text-sm text-muted-foreground">Cubiertas</p>
                <p className="text-2xl font-bold">{filledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{vacancies.length}</p>
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
                placeholder="Buscar por título o descripción..."
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
              <Button variant="outline" onClick={fetchVacancies}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vacancies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vacantes Internas</CardTitle>
          <CardDescription>
            {vacancies.length} vacante(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : vacancies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron vacantes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Aplicaciones</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacancies.map((vacancy) => (
                  <TableRow key={vacancy.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{vacancy.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {vacancy.experience_required}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{vacancy.department_name}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {vacancy.application_count || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {vacancy.application_deadline 
                        ? new Date(vacancy.application_deadline).toLocaleDateString('es-ES')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[vacancy.status]} className="gap-1">
                        {statusIcons[vacancy.status]}
                        {statusLabels[vacancy.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openViewDialog(vacancy)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {vacancy.status === 'draft' && (
                          <>
                            <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(vacancy)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => handleDelete(vacancy.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {vacancy.status === 'pending_approval' && !vacancy.budget_approved && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleApproveBudget(vacancy.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Aprobar Presupuesto"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                        {(vacancy.status === 'draft' || vacancy.status === 'pending_approval') && vacancy.budget_approved && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handlePublish(vacancy.id)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Publicar Vacante"
                          >
                            <Globe className="h-4 w-4" />
                          </Button>
                        )}
                        {vacancy.status === 'published' && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleClose(vacancy.id)}
                            className="text-yellow-600 hover:text-yellow-700"
                            title="Cerrar Vacante"
                          >
                            <Clock className="h-4 w-4" />
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
            <DialogTitle>Nueva Vacante Interna</DialogTitle>
            <DialogDescription>
              Cree una nueva vacante para el bloque tecnológico
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título del Puesto *</label>
                <Input
                  placeholder="Analista de Sistemas Senior"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Departamento *</label>
                <Select 
                  value={formData.department ? formData.department.toString() : ''} 
                  onValueChange={(v) => setFormData({ ...formData, department: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción del Puesto *</label>
              <Textarea
                placeholder="Descripción general del puesto..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Responsabilidades *</label>
              <Textarea
                placeholder="Lista de responsabilidades del puesto..."
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Requisitos Técnicos *</label>
              <Textarea
                placeholder="Conocimientos técnicos requeridos..."
                value={formData.technical_requirements}
                onChange={(e) => setFormData({ ...formData, technical_requirements: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Competencias *</label>
                <Textarea
                  placeholder="Competencias requeridas..."
                  value={formData.competencies}
                  onChange={(e) => setFormData({ ...formData, competencies: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Experiencia Mínima *</label>
                <Input
                  placeholder="3+ años en desarrollo"
                  value={formData.experience_required}
                  onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rango Salarial Mínimo</label>
                <Input
                  type="number"
                  placeholder="30000"
                  value={formData.salary_range_min}
                  onChange={(e) => setFormData({ ...formData, salary_range_min: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rango Salarial Máximo</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.salary_range_max}
                  onChange={(e) => setFormData({ ...formData, salary_range_max: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Requerida</label>
                <Input
                  type="date"
                  value={formData.required_date}
                  onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Límite de Postulación</label>
                <Input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Justificación de la Solicitud *</label>
              <Textarea
                placeholder="Explique por qué se necesita cubrir esta vacante..."
                value={formData.authorization_justification}
                onChange={(e) => setFormData({ ...formData, authorization_justification: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear Vacante</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Vacante</DialogTitle>
            <DialogDescription>
              Actualice la información de la vacante
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título del Puesto *</label>
                <Input
                  placeholder="Analista de Sistemas Senior"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Departamento *</label>
                <Select 
                  value={formData.department ? formData.department.toString() : ''} 
                  onValueChange={(v) => setFormData({ ...formData, department: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción del Puesto *</label>
              <Textarea
                placeholder="Descripción general del puesto..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Responsabilidades *</label>
              <Textarea
                placeholder="Lista de responsabilidades del puesto..."
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Requisitos Técnicos *</label>
              <Textarea
                placeholder="Conocimientos técnicos requeridos..."
                value={formData.technical_requirements}
                onChange={(e) => setFormData({ ...formData, technical_requirements: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Competencias *</label>
                <Textarea
                  placeholder="Competencias requeridas..."
                  value={formData.competencies}
                  onChange={(e) => setFormData({ ...formData, competencies: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Experiencia Mínima *</label>
                <Input
                  placeholder="3+ años en desarrollo"
                  value={formData.experience_required}
                  onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rango Salarial Mínimo</label>
                <Input
                  type="number"
                  placeholder="30000"
                  value={formData.salary_range_min}
                  onChange={(e) => setFormData({ ...formData, salary_range_min: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rango Salarial Máximo</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.salary_range_max}
                  onChange={(e) => setFormData({ ...formData, salary_range_max: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Requerida</label>
                <Input
                  type="date"
                  value={formData.required_date}
                  onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Límite de Postulación</label>
                <Input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Justificación de la Solicitud *</label>
              <Textarea
                placeholder="Explique por qué se necesita cubrir esta vacante..."
                value={formData.authorization_justification}
                onChange={(e) => setFormData({ ...formData, authorization_justification: e.target.value })}
                rows={2}
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
              <Briefcase className="h-5 w-5" />
              {selectedVacancy?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedVacancy?.department_name}
            </DialogDescription>
          </DialogHeader>
          {selectedVacancy && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <p>
                    <Badge variant={statusColors[selectedVacancy.status]} className="gap-1">
                      {statusIcons[selectedVacancy.status]}
                      {statusLabels[selectedVacancy.status]}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Presupuesto</span>
                  <p>
                    {selectedVacancy.budget_approved ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Aprobado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pendiente
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Descripción</span>
                <p className="text-sm mt-1">{selectedVacancy.description}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Responsabilidades</span>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{selectedVacancy.responsibilities}</pre>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Requisitos Técnicos</span>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{selectedVacancy.technical_requirements}</pre>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Competencias</span>
                  <p className="text-sm mt-1">{selectedVacancy.competencies}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Experiencia Requerida</span>
                  <p className="font-medium">{selectedVacancy.experience_required}</p>
                </div>
              </div>
              
              {(selectedVacancy.salary_range_min || selectedVacancy.salary_range_max) && (
                <div>
                  <span className="text-sm text-muted-foreground">Rango Salarial</span>
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {selectedVacancy.salary_range_min?.toLocaleString() || 'No definido'} - 
                    {selectedVacancy.salary_range_max?.toLocaleString() || 'No definido'}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Aplicaciones</span>
                  <p className="font-medium flex items-center gap-1">
                    <UserPlus className="h-4 w-4" />
                    {selectedVacancy.application_count || 0} postulantes
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Fecha Límite</span>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {selectedVacancy.application_deadline 
                      ? new Date(selectedVacancy.application_deadline).toLocaleDateString('es-ES')
                      : 'No definida'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Justificación</span>
                <p className="text-sm mt-1">{selectedVacancy.authorization_justification}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Solicitado por</span>
                  <p className="font-medium">{selectedVacancy.requested_by_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">RRHH</span>
                  <p className="font-medium">{selectedVacancy.hr_manager_name || 'No asignado'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  Creada: {new Date(selectedVacancy.created_at).toLocaleDateString('es-ES')}
                </div>
                {selectedVacancy.published_at && (
                  <div>
                    Publicada: {new Date(selectedVacancy.published_at).toLocaleDateString('es-ES')}
                  </div>
                )}
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
