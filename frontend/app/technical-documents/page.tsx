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
  BookOpen, 
  Plus, 
  Search, 
  FileText, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { technicalDocumentApi } from '@/lib/api';
import type { TechnicalDocument, PaginatedResponse } from '@/lib/api/types';

const documentTypeLabels: Record<string, string> = {
  manual: 'Manual Técnico',
  procedure: 'Procedimiento',
  policy: 'Política',
  guide: 'Guía de Usuario',
  specification: 'Especificación',
  other: 'Otro',
};

const statusLabels: Record<string, string> = {
  available: 'Disponible',
  on_loan: 'En Préstamo',
  archived: 'Archivado',
  under_review: 'En Revisión',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  available: 'default',
  on_loan: 'secondary',
  archived: 'outline',
  under_review: 'destructive',
};

export default function TechnicalDocumentsPage() {
  const [documents, setDocuments] = useState<TechnicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<TechnicalDocument | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    code: string;
    description: string;
    document_type: 'manual' | 'procedure' | 'policy' | 'guide' | 'specification' | 'other';
    physical_location: string;
    version: string;
  }>({
    title: '',
    code: '',
    description: '',
    document_type: 'manual',
    physical_location: '',
    version: '1.0',
  });

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (filterType !== 'all') params.document_type = filterType;
    if (filterStatus !== 'all') params.status = filterStatus;

    const response = await technicalDocumentApi.list(params);
    if (response.data) {
      setDocuments((response.data as PaginatedResponse<TechnicalDocument>).results || []);
    }
    setLoading(false);
  }, [searchTerm, filterType, filterStatus]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreate = async () => {
    const response = await technicalDocumentApi.create(formData);
    if (response.data) {
      setIsCreateDialogOpen(false);
      resetForm();
      fetchDocuments();
    }
  };

  const handleUpdate = async () => {
    if (!selectedDocument) return;
    const response = await technicalDocumentApi.update(selectedDocument.id, formData);
    if (response.data) {
      setIsEditDialogOpen(false);
      resetForm();
      fetchDocuments();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este documento?')) {
      await technicalDocumentApi.delete(id);
      fetchDocuments();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      description: '',
      document_type: 'manual',
      physical_location: '',
      version: '1.0',
    });
    setSelectedDocument(null);
  };

  const openEditDialog = (doc: TechnicalDocument) => {
    setSelectedDocument(doc);
    setFormData({
      title: doc.title,
      code: doc.code,
      description: doc.description,
      document_type: doc.document_type,
      physical_location: doc.physical_location,
      version: doc.version,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (doc: TechnicalDocument) => {
    setSelectedDocument(doc);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Documentación Técnica
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión y consulta de documentación técnica del IMCP
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Documento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
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
              <Button variant="outline" onClick={fetchDocuments}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Documentos</CardTitle>
          <CardDescription>
            {documents.length} documento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron documentos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-mono font-semibold">{doc.code}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{doc.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {documentTypeLabels[doc.document_type] || doc.document_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {doc.physical_location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[doc.status]}>
                        {statusLabels[doc.status] || doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openViewDialog(doc)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(doc)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {doc.file && (
                          <Button variant="ghost" size="icon-sm" asChild>
                            <a href={doc.file} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          onClick={() => handleDelete(doc.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo Documento Técnico</DialogTitle>
            <DialogDescription>
              Registre un nuevo documento en el catálogo del IMCP
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Código *</label>
                <Input
                  placeholder="DOC-001"
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
                placeholder="Manual de Operaciones"
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
                <label className="text-sm font-medium">Ubicación Física *</label>
                <Input
                  placeholder="Archivo A-15"
                  value={formData.physical_location}
                  onChange={(e) => setFormData({ ...formData, physical_location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                placeholder="Descripción del documento..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear Documento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>
              Actualice la información del documento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Código *</label>
                <Input
                  placeholder="DOC-001"
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
                placeholder="Manual de Operaciones"
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
                <label className="text-sm font-medium">Ubicación Física *</label>
                <Input
                  placeholder="Archivo A-15"
                  value={formData.physical_location}
                  onChange={(e) => setFormData({ ...formData, physical_location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                placeholder="Descripción del documento..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedDocument?.title}
            </DialogTitle>
            <DialogDescription>
              Código: {selectedDocument?.code}
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Tipo de Documento</span>
                  <p className="font-medium">{documentTypeLabels[selectedDocument.document_type]}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <p>
                    <Badge variant={statusColors[selectedDocument.status]}>
                      {statusLabels[selectedDocument.status]}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Ubicación Física</span>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedDocument.physical_location}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Versión</span>
                  <p className="font-medium">{selectedDocument.version}</p>
                </div>
              </div>
              {selectedDocument.department_name && (
                <div>
                  <span className="text-sm text-muted-foreground">Departamento</span>
                  <p className="font-medium">{selectedDocument.department_name}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Descripción</span>
                <p className="text-sm mt-1">{selectedDocument.description || 'Sin descripción'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Creado por</span>
                <p className="font-medium">{selectedDocument.created_by_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedDocument.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
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
