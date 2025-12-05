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
  Trash2, 
  Send,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { internalVacancyApi } from '@/lib/api';
import type { InternalVacancy, PaginatedResponse } from '@/lib/api/types';

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  pending_approval: 'Pendiente Aprobación',
  published: 'Publicada',
  closed: 'Cerrada',
  filled: 'Cubierta',
  cancelled: 'Cancelada',
};

export default function InternalVacanciesAdminPage() {
  const [vacancies, setVacancies] = useState<InternalVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    technical_requirements: '',
    competencies: '',
    experience_required: '',
    authorization_justification: '',
  });

  // Fetch vacancies
  const fetchVacancies = useCallback(async () => {
    setLoading(true);
    const params: { status?: string; search?: string } = {};
    
    if (filterStatus !== 'all') params.status = filterStatus;
    if (searchTerm) params.search = searchTerm;

    const response = await internalVacancyApi.list(params);
    if (response.data) {
      const results = (response.data as PaginatedResponse<InternalVacancy>).results || [];
      setVacancies(results);
    }
    setLoading(false);
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      responsibilities: '',
      technical_requirements: '',
      competencies: '',
      experience_required: '',
      authorization_justification: '',
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await internalVacancyApi.create(formData);
      
      if (response.data) {
        setIsCreateDialogOpen(false);
        fetchVacancies();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta vacante?')) {
      await internalVacancyApi.delete(id);
      fetchVacancies();
    }
  };

  const handleApproveBudget = async (id: number) => {
    await internalVacancyApi.approveBudget(id);
    fetchVacancies();
  };

  const handlePublish = async (id: number) => {
    await internalVacancyApi.publish(id);
    fetchVacancies();
  };

  const handleClose = async (id: number) => {
    if (confirm('¿Está seguro de cerrar esta vacante?')) {
      await internalVacancyApi.close(id);
      fetchVacancies();
    }
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
        <Link href="/internal-vacancies" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Vacantes Internas</h1>
            <p className="text-muted-foreground">Administración de vacantes internas</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Publicar Vacante
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
                placeholder="Buscar vacantes..."
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

      {/* Vacancies Table */}
      <Card>
        <CardContent className="p-0">
          {vacancies.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron vacantes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Experiencia Requerida</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Publicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacancies.map((vacancy) => (
                  <TableRow key={vacancy.id}>
                    <TableCell className="font-medium">{vacancy.title}</TableCell>
                    <TableCell>{vacancy.experience_required || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={vacancy.status === 'published' ? 'default' : 'outline'}>
                        {statusLabels[vacancy.status] || vacancy.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(vacancy.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {vacancy.status === 'pending_approval' && !vacancy.budget_approved && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApproveBudget(vacancy.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {vacancy.status === 'pending_approval' && vacancy.budget_approved && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePublish(vacancy.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        {vacancy.status === 'published' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleClose(vacancy.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(vacancy.id)}>
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Publicar Nueva Vacante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-2">Título del Puesto</label>
              <Input
                placeholder="Ej: Analista de Crédito Senior"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <Textarea
                rows={3}
                placeholder="Descripción general del puesto"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Responsabilidades</label>
              <Textarea
                rows={3}
                placeholder="Principales responsabilidades"
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Requisitos Técnicos</label>
              <Textarea
                rows={3}
                placeholder="Requisitos técnicos necesarios"
                value={formData.technical_requirements}
                onChange={(e) => setFormData({ ...formData, technical_requirements: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Competencias</label>
              <Textarea
                rows={2}
                placeholder="Competencias requeridas"
                value={formData.competencies}
                onChange={(e) => setFormData({ ...formData, competencies: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Experiencia Requerida</label>
              <Input
                placeholder="Ej: 5+ años de experiencia"
                value={formData.experience_required}
                onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Justificación</label>
              <Textarea
                rows={2}
                placeholder="Justificación de la vacante"
                value={formData.authorization_justification}
                onChange={(e) => setFormData({ ...formData, authorization_justification: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar Vacante'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
