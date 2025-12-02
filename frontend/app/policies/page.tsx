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
  ScrollText, 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Send,
  Clock,
  CheckCircle,
  Globe,
  Archive,
  Gavel,
  UserCheck,
  Users
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

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  under_review: 'secondary',
  pending_signatures: 'secondary',
  approved: 'default',
  published: 'default',
  obsolete: 'destructive',
};

const originLabels: Record<string, string> = {
  sudeban: 'SUDEBAN',
  bcv: 'BCV',
  audit: 'Auditoría',
  improvement: 'Mejora de Procesos',
  internal: 'Iniciativa Interna',
  other: 'Otro',
};

const originColors: Record<string, string> = {
  sudeban: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  bcv: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  audit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  improvement: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  internal: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOrigin, setFilterOrigin] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    code: string;
    description: string;
    content: string;
    origin: 'sudeban' | 'bcv' | 'audit' | 'improvement' | 'internal' | 'other';
    origin_justification: string;
    version: string;
  }>({
    title: '',
    code: '',
    description: '',
    content: '',
    origin: 'internal',
    origin_justification: '',
    version: '1.0',
  });

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (filterStatus !== 'all') params.status = filterStatus;
    if (filterOrigin !== 'all') params.origin = filterOrigin;

    const response = await policyApi.list(params);
    if (response.data) {
      setPolicies((response.data as PaginatedResponse<Policy>).results || []);
    }
    setLoading(false);
  }, [searchTerm, filterStatus, filterOrigin]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleCreate = async () => {
    const response = await policyApi.create(formData);
    if (response.data) {
      setIsCreateDialogOpen(false);
      resetForm();
      fetchPolicies();
    }
  };

  const handleUpdate = async () => {
    if (!selectedPolicy) return;
    const response = await policyApi.update(selectedPolicy.id, formData);
    if (response.data) {
      setIsEditDialogOpen(false);
      resetForm();
      fetchPolicies();
    }
  };

  const handleSubmitForReview = async (id: number) => {
    if (confirm('¿Está seguro de enviar esta política para revisión?')) {
      const response = await policyApi.submitForReview(id);
      if (response.data) {
        fetchPolicies();
      }
    }
  };

  const handleApproveBoard = async (id: number) => {
    const today = new Date().toISOString().split('T')[0];
    if (confirm('¿Está seguro de aprobar esta política por la junta directiva?')) {
      const response = await policyApi.approveBoard(id, today);
      if (response.data) {
        fetchPolicies();
      }
    }
  };

  const handlePublish = async (id: number) => {
    if (confirm('¿Está seguro de publicar esta política?')) {
      const response = await policyApi.publish(id);
      if (response.data) {
        fetchPolicies();
      }
    }
  };

  const handleMarkObsolete = async (id: number) => {
    if (confirm('¿Está seguro de marcar esta política como obsoleta?')) {
      const response = await policyApi.markObsolete(id);
      if (response.data) {
        fetchPolicies();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta política?')) {
      await policyApi.delete(id);
      fetchPolicies();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      description: '',
      content: '',
      origin: 'internal',
      origin_justification: '',
      version: '1.0',
    });
    setSelectedPolicy(null);
  };

  const openEditDialog = (policy: Policy) => {
    setSelectedPolicy(policy);
    setFormData({
      title: policy.title,
      code: policy.code,
      description: policy.description,
      content: policy.content,
      origin: policy.origin,
      origin_justification: policy.origin_justification,
      version: policy.version,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsViewDialogOpen(true);
  };

  const draftCount = policies.filter(p => p.status === 'draft').length;
  const publishedCount = policies.filter(p => p.status === 'published').length;
  const reviewCount = policies.filter(p => ['under_review'].includes(p.status)).length;
  const pendingSignaturesCount = policies.filter(p => p.status === 'pending_signatures').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ScrollText className="h-8 w-8 text-primary" />
            Políticas Institucionales
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema para crear, revisar y publicar políticas tecnológicas
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Política
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
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
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <UserCheck className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Revisión</p>
                <p className="text-2xl font-bold">{reviewCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Gavel className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pend. Firmas</p>
                <p className="text-2xl font-bold">{pendingSignaturesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Globe className="h-5 w-5 text-green-600" />
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
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{policies.length}</p>
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
                placeholder="Buscar por código, título o contenido..."
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
              <Select value={filterOrigin} onValueChange={setFilterOrigin}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los orígenes</SelectItem>
                  {Object.entries(originLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchPolicies}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Políticas</CardTitle>
          <CardDescription>
            {policies.length} política(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron políticas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-mono font-semibold">{policy.code}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{policy.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${originColors[policy.origin]}`}>
                        {originLabels[policy.origin] || policy.origin}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[policy.status]}>
                        {statusLabels[policy.status] || policy.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{policy.version}</TableCell>
                    <TableCell>
                      {policy.effective_date 
                        ? new Date(policy.effective_date).toLocaleDateString('es-ES')
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openViewDialog(policy)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {policy.status === 'draft' && (
                          <>
                            <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(policy)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => handleSubmitForReview(policy.id)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Enviar a Revisión"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => handleDelete(policy.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {policy.status === 'pending_signatures' && !policy.board_approved && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleApproveBoard(policy.id)}
                            className="text-purple-600 hover:text-purple-700"
                            title="Aprobar por Junta Directiva"
                          >
                            <Gavel className="h-4 w-4" />
                          </Button>
                        )}
                        {policy.status === 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handlePublish(policy.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Publicar"
                          >
                            <Globe className="h-4 w-4" />
                          </Button>
                        )}
                        {policy.status === 'published' && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleMarkObsolete(policy.id)}
                            className="text-yellow-600 hover:text-yellow-700"
                            title="Marcar Obsoleta"
                          >
                            <Archive className="h-4 w-4" />
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
            <DialogTitle>Nueva Política</DialogTitle>
            <DialogDescription>
              Cree una nueva política institucional
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Código *</label>
                <Input
                  placeholder="POL-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Versión</label>
                <Input
                  placeholder="1.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Política de Seguridad de la Información"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Origen de la Necesidad</label>
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
              <label className="text-sm font-medium">Justificación *</label>
              <Textarea
                placeholder="Explique el motivo de esta política..."
                value={formData.origin_justification}
                onChange={(e) => setFormData({ ...formData, origin_justification: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                placeholder="Descripción general de la política..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido de la Política *</label>
              <Textarea
                placeholder="Escriba el contenido completo de la política..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear Política</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Política</DialogTitle>
            <DialogDescription>
              Actualice el contenido de la política
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Código *</label>
                <Input
                  placeholder="POL-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Versión</label>
                <Input
                  placeholder="1.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Política de Seguridad de la Información"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Origen de la Necesidad</label>
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
              <label className="text-sm font-medium">Justificación *</label>
              <Textarea
                placeholder="Explique el motivo de esta política..."
                value={formData.origin_justification}
                onChange={(e) => setFormData({ ...formData, origin_justification: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                placeholder="Descripción general de la política..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido de la Política *</label>
              <Textarea
                placeholder="Escriba el contenido completo de la política..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
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
              <ScrollText className="h-5 w-5" />
              {selectedPolicy?.code} - {selectedPolicy?.title}
            </DialogTitle>
            <DialogDescription>
              Versión {selectedPolicy?.version}
            </DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <p>
                    <Badge variant={statusColors[selectedPolicy.status]}>
                      {statusLabels[selectedPolicy.status]}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Origen</span>
                  <p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${originColors[selectedPolicy.origin]}`}>
                      {originLabels[selectedPolicy.origin]}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Justificación</span>
                <p className="text-sm mt-1">{selectedPolicy.origin_justification}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Descripción</span>
                <p className="text-sm mt-1">{selectedPolicy.description || 'Sin descripción'}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Contenido</span>
                <div className="mt-2 p-4 bg-muted rounded-lg max-h-[300px] overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{selectedPolicy.content}</pre>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Creado por</span>
                  <p className="font-medium">{selectedPolicy.created_by_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Junta Directiva</span>
                  <p>
                    {selectedPolicy.board_approved ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Aprobada
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
              
              {selectedPolicy.effective_date && (
                <div>
                  <span className="text-sm text-muted-foreground">Fecha de Vigencia</span>
                  <p className="font-medium">
                    {new Date(selectedPolicy.effective_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  Creada: {new Date(selectedPolicy.created_at).toLocaleDateString('es-ES')}
                </div>
                <div>
                  Actualizada: {new Date(selectedPolicy.updated_at).toLocaleDateString('es-ES')}
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
