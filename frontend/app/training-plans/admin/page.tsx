'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
  Edit, 
  Trash2, 
  CheckCircle,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { trainingPlanApi } from '@/lib/api';
import type { TrainingPlan, PaginatedResponse } from '@/lib/api/types';

const statusLabels: Record<string, string> = {
  planning: 'Planificación',
  budget_review: 'Revisión de Presupuesto',
  quotation: 'Cotización',
  approved: 'Aprobado',
  scheduled: 'Programado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const originLabels: Record<string, string> = {
  performance: 'Desempeño',
  new_technology: 'Nueva Tecnología',
  regulation: 'Regulación',
  audit: 'Auditoría',
  other: 'Otro',
};

export default function TrainingPlansAdminPage() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topics: '',
    origin: 'performance' as TrainingPlan['origin'],
    scope: 'intergerencial' as TrainingPlan['scope'],
    modality: 'presential' as TrainingPlan['modality'],
    duration_hours: 0,
  });

  // Fetch training plans
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const params: { status?: string; search?: string } = {};
    
    if (filterStatus !== 'all') params.status = filterStatus;
    if (searchTerm) params.search = searchTerm;

    const response = await trainingPlanApi.list(params);
    if (response.data) {
      const results = (response.data as PaginatedResponse<TrainingPlan>).results || [];
      setPlans(results);
    }
    setLoading(false);
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      topics: '',
      origin: 'performance',
      scope: 'intergerencial',
      modality: 'presential',
      duration_hours: 0,
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await trainingPlanApi.create(formData);
      
      if (response.data) {
        setIsCreateDialogOpen(false);
        fetchPlans();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este plan de capacitación?')) {
      await trainingPlanApi.delete(id);
      fetchPlans();
    }
  };

  const handleApproveBudget = async (id: number) => {
    await trainingPlanApi.approveBudget(id);
    fetchPlans();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/training-plans" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Planes de Capacitación</h1>
            <p className="text-muted-foreground">Administración de planes de capacitación</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crear Plan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Buscar planes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardContent className="p-0">
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron planes de capacitación</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Modalidad</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell>{originLabels[plan.origin] || plan.origin}</TableCell>
                    <TableCell className="capitalize">{plan.modality}</TableCell>
                    <TableCell>{plan.duration_hours}h</TableCell>
                    <TableCell>
                      <Badge variant={plan.status === 'completed' ? 'default' : 'outline'}>
                        {statusLabels[plan.status] || plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {plan.status === 'budget_review' && !plan.budget_approved && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApproveBudget(plan.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(plan.id)}>
                          <Trash2 className="w-4 h-4" />
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Plan de Capacitación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <Input
                placeholder="Título del plan"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <Textarea
                rows={3}
                placeholder="Descripción del plan"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Temas</label>
              <Textarea
                rows={2}
                placeholder="Temas a cubrir"
                value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Origen</label>
                <Select
                  value={formData.origin}
                  onValueChange={(value: any) => setFormData({ ...formData, origin: value })}
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
              <div>
                <label className="block text-sm font-medium mb-2">Modalidad</label>
                <Select
                  value={formData.modality}
                  onValueChange={(value: any) => setFormData({ ...formData, modality: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presential">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duración (horas)</label>
              <Input
                type="number"
                placeholder="Duración en horas"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
