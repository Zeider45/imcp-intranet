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
  PenTool, 
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
  XCircle,
  AlertCircle
} from 'lucide-react';
import { documentDraftApi } from '@/lib/api';
import type { DocumentDraft, PaginatedResponse } from '@/lib/api/types';

const documentTypeLabels: Record<string, string> = {
  technical_manual: 'Manual Técnico',
  user_guide: 'Guía de Usuario',
  functional_spec: 'Especificación Funcional',
  procedure: 'Procedimiento Operativo',
  other: 'Otro',
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  under_review: 'En Revisión',
  pending_approval: 'Pendiente de Aprobación',
  approved: 'Aprobado',
  approved_with_observations: 'Aprobado con Observaciones',
  rejected: 'Rechazado',
  published: 'Publicado',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  under_review: 'secondary',
  pending_approval: 'secondary',
  approved: 'default',
  approved_with_observations: 'default',
  rejected: 'destructive',
  published: 'default',
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Edit className="h-3 w-3" />,
  under_review: <Clock className="h-3 w-3" />,
  pending_approval: <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  approved_with_observations: <AlertCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  published: <CheckCircle className="h-3 w-3" />,
};

export default function DocumentDraftsPage() {
  const [drafts, setDrafts] = useState<DocumentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<DocumentDraft | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    document_type: 'technical_manual' | 'user_guide' | 'functional_spec' | 'procedure' | 'other';
    content: string;
    system_or_functionality: string;
    version: string;
  }>({
    title: '',
    document_type: 'technical_manual',
    content: '',
    system_or_functionality: '',
    version: '1.0',
  });

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (filterType !== 'all') params.document_type = filterType;
    if (filterStatus !== 'all') params.status = filterStatus;

    const response = await documentDraftApi.list(params);
    if (response.data) {
      setDrafts((response.data as PaginatedResponse<DocumentDraft>).results || []);
    }
    setLoading(false);
  }, [searchTerm, filterType, filterStatus]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleCreate = async () => {
    const response = await documentDraftApi.create(formData);
    if (response.data) {
      setIsCreateDialogOpen(false);
      resetForm();
      fetchDrafts();
    }
  };

  const handleUpdate = async () => {
    if (!selectedDraft) return;
    const response = await documentDraftApi.update(selectedDraft.id, formData);
    if (response.data) {
      setIsEditDialogOpen(false);
      resetForm();
      fetchDrafts();
    }
  };

  const handleSubmitForReview = async (id: number) => {
    if (confirm('¿Está seguro de enviar este borrador para revisión?')) {
      const response = await documentDraftApi.submitForReview(id);
      if (response.data) {
        fetchDrafts();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este borrador?')) {
      await documentDraftApi.delete(id);
      fetchDrafts();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      document_type: 'technical_manual',
      content: '',
      system_or_functionality: '',
      version: '1.0',
    });
    setSelectedDraft(null);
  };

  const openEditDialog = (draft: DocumentDraft) => {
    setSelectedDraft(draft);
    setFormData({
      title: draft.title,
      document_type: draft.document_type,
      content: draft.content,
      system_or_functionality: draft.system_or_functionality,
      version: draft.version,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (draft: DocumentDraft) => {
    setSelectedDraft(draft);
    setIsViewDialogOpen(true);
  };

  const draftCount = drafts.filter(d => d.status === 'draft').length;
  const pendingCount = drafts.filter(d => ['under_review', 'pending_approval'].includes(d.status)).length;
  const approvedCount = drafts.filter(d => ['approved', 'approved_with_observations', 'published'].includes(d.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PenTool className="h-8 w-8 text-primary" />
            Elaboración de Documentación
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema para crear y gestionar borradores de documentación técnica
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Borrador
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
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Revisión</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
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
                <p className="text-sm text-muted-foreground">Aprobados</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
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
                <p className="text-2xl font-bold">{drafts.length}</p>
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
                placeholder="Buscar por título o sistema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Button variant="outline" onClick={fetchDrafts}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drafts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Borradores</CardTitle>
          <CardDescription>
            {drafts.length} borrador(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron borradores</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Sistema/Funcionalidad</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drafts.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {draft.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {documentTypeLabels[draft.document_type] || draft.document_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[150px]">
                      {draft.system_or_functionality}
                    </TableCell>
                    <TableCell>{draft.author_name}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[draft.status]} className="gap-1">
                        {statusIcons[draft.status]}
                        {statusLabels[draft.status] || draft.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{draft.version}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openViewDialog(draft)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {draft.status === 'draft' && (
                          <>
                            <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(draft)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => handleSubmitForReview(draft.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => handleDelete(draft.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
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
            <DialogTitle>Nuevo Borrador de Documentación</DialogTitle>
            <DialogDescription>
              Cree un nuevo borrador de documentación técnica
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Manual de Usuario del Sistema X"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Documento</label>
                <Select 
                  value={formData.document_type} 
                  onValueChange={(v) => setFormData({ ...formData, document_type: v as typeof formData.document_type })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(documentTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <label className="text-sm font-medium">Sistema/Funcionalidad Documentada *</label>
              <Input
                placeholder="Sistema de Gestión de Inventarios"
                value={formData.system_or_functionality}
                onChange={(e) => setFormData({ ...formData, system_or_functionality: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido *</label>
              <Textarea
                placeholder="Escriba el contenido del documento..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear Borrador</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Borrador</DialogTitle>
            <DialogDescription>
              Actualice el contenido del borrador
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Manual de Usuario del Sistema X"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Documento</label>
                <Select 
                  value={formData.document_type} 
                  onValueChange={(v) => setFormData({ ...formData, document_type: v as typeof formData.document_type })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(documentTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <label className="text-sm font-medium">Sistema/Funcionalidad Documentada *</label>
              <Input
                placeholder="Sistema de Gestión de Inventarios"
                value={formData.system_or_functionality}
                onChange={(e) => setFormData({ ...formData, system_or_functionality: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido *</label>
              <Textarea
                placeholder="Escriba el contenido del documento..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
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
              <FileText className="h-5 w-5" />
              {selectedDraft?.title}
            </DialogTitle>
            <DialogDescription>
              {documentTypeLabels[selectedDraft?.document_type || '']} - Versión {selectedDraft?.version}
            </DialogDescription>
          </DialogHeader>
          {selectedDraft && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Sistema/Funcionalidad</span>
                  <p className="font-medium">{selectedDraft.system_or_functionality}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <p>
                    <Badge variant={statusColors[selectedDraft.status]} className="gap-1">
                      {statusIcons[selectedDraft.status]}
                      {statusLabels[selectedDraft.status]}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Autor</span>
                  <p className="font-medium">{selectedDraft.author_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Gerente Asignado</span>
                  <p className="font-medium">{selectedDraft.manager_name || '-'}</p>
                </div>
              </div>
              {selectedDraft.department_name && (
                <div>
                  <span className="text-sm text-muted-foreground">Departamento</span>
                  <p className="font-medium">{selectedDraft.department_name}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Contenido</span>
                <div className="mt-2 p-4 bg-muted rounded-lg max-h-[300px] overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{selectedDraft.content}</pre>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  Creado: {new Date(selectedDraft.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div>
                  Actualizado: {new Date(selectedDraft.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
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
