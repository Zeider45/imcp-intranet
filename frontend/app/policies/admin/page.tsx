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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ScrollText, 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  Send,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { policyApi } from '@/lib/api';
import type { Policy, PaginatedResponse } from '@/lib/api/types';

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  under_review: 'En Revisión',
  pending_signatures: 'Pendiente Firmas',
  approved: 'Aprobada',
  published: 'Publicada',
  obsolete: 'Obsoleta',
};

const originLabels: Record<string, string> = {
  sudeban: 'SUDEBAN',
  bcv: 'BCV',
  audit: 'Auditoría',
  improvement: 'Mejora de Procesos',
  internal: 'Iniciativa Interna',
  other: 'Otro',
};

export default function PoliciesAdminPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [activeTab, setActiveTab] = useState<'draft' | 'under_review' | 'published'>('published');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    content: '',
    origin: 'internal' as Policy['origin'],
    origin_justification: '',
    version: '1.0',
  });

  const areas = ['all', 'sudeban', 'bcv', 'audit', 'improvement', 'internal', 'other'];

  // Fetch policies
  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    const params: { status?: string; origin?: string; search?: string } = {};
    
    if (activeTab !== 'published') {
      params.status = activeTab;
    } else {
      params.status = 'published';
    }
    
    if (selectedArea !== 'all') params.origin = selectedArea;
    if (searchTerm) params.search = searchTerm;

    const response = await policyApi.list(params);
    if (response.data) {
      const results = (response.data as PaginatedResponse<Policy>).results || [];
      setPolicies(results);
    }
    setLoading(false);
  }, [activeTab, selectedArea, searchTerm]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleCreate = () => {
    setFormData({
      title: '',
      code: '',
      description: '',
      content: '',
      origin: 'internal',
      origin_justification: '',
      version: '1.0',
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await policyApi.create(formData);
      
      if (response.data) {
        setIsCreateDialogOpen(false);
        setFormData({
          title: '',
          code: '',
          description: '',
          content: '',
          origin: 'internal',
          origin_justification: '',
          version: '1.0',
        });
        fetchPolicies();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta política?')) {
      await policyApi.delete(id);
      fetchPolicies();
    }
  };

  const handleSubmitForReview = async (id: number) => {
    await policyApi.submitForReview(id);
    fetchPolicies();
  };

  const handleApproveBoard = async (id: number) => {
    const today = new Date().toISOString().split('T')[0];
    await policyApi.approveBoard(id, today);
    fetchPolicies();
  };

  const handlePublish = async (id: number) => {
    await policyApi.publish(id);
    fetchPolicies();
  };

  const handleMarkObsolete = async (id: number) => {
    if (confirm('¿Está seguro de marcar esta política como obsoleta?')) {
      await policyApi.markObsolete(id);
      fetchPolicies();
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
        <Link href="/policies" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Políticas</h1>
            <p className="text-muted-foreground">Administración de políticas institucionales</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crear Nueva Política
          </Button>
        </div>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="mb-6">
        <TabsList>
          <TabsTrigger value="draft">Borradores</TabsTrigger>
          <TabsTrigger value="under_review">En Revisión</TabsTrigger>
          <TabsTrigger value="published">Publicadas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Buscar políticas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  {areas.slice(1).map((area) => (
                    <SelectItem key={area} value={area}>
                      {originLabels[area] || area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardContent className="p-0">
          {policies.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron políticas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.title}</TableCell>
                    <TableCell>{policy.code}</TableCell>
                    <TableCell>{originLabels[policy.origin] || policy.origin}</TableCell>
                    <TableCell>{policy.version}</TableCell>
                    <TableCell>
                      <Badge variant={policy.status === 'published' ? 'default' : 'outline'}>
                        {statusLabels[policy.status] || policy.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(policy.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {policy.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSubmitForReview(policy.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        {policy.status === 'pending_signatures' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApproveBoard(policy.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {policy.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePublish(policy.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        {policy.status === 'published' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkObsolete(policy.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(policy.id)}>
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
            <DialogTitle>Crear Nueva Política</DialogTitle>
            <DialogDescription>
              Complete los detalles de la política
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título de la Política</label>
              <Input
                placeholder="Ingrese el título de la política"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Código</label>
              <Input
                placeholder="Código de la política"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Área</label>
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
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <Textarea
                rows={4}
                placeholder="Descripción de la política"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Justificación de Origen</label>
              <Textarea
                rows={3}
                placeholder="Justificación del origen de esta política"
                value={formData.origin_justification}
                onChange={(e) => setFormData({ ...formData, origin_justification: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Política'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
