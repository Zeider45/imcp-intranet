'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Library, 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Download,
  Upload,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  BookOpen,
  Archive,
  File,
  X
} from 'lucide-react';
import { libraryDocumentApi } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api/client';
import type { LibraryDocument, PaginatedResponse } from '@/lib/api/types';

const documentTypeLabels: Record<string, string> = {
  manual: 'Manual Técnico',
  procedure: 'Procedimiento',
  policy: 'Política',
  guide: 'Guía de Usuario',
  specification: 'Especificación',
  form: 'Formulario',
  report: 'Reporte',
  other: 'Otro',
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  pending_approval: 'Pendiente de Aprobación',
  approved: 'Aprobado',
  approved_with_observations: 'Aprobado con Observaciones',
  rejected: 'Rechazado',
  published: 'Publicado',
  archived: 'Archivado',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  pending_approval: 'secondary',
  approved: 'default',
  approved_with_observations: 'default',
  rejected: 'destructive',
  published: 'default',
  archived: 'outline',
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Edit className="h-3 w-3" />,
  pending_approval: <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  approved_with_observations: <AlertCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  published: <BookOpen className="h-3 w-3" />,
  archived: <Archive className="h-3 w-3" />,
};

export default function LibraryDocumentsPage() {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LibraryDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<{
    title: string;
    code: string;
    description: string;
    content: string;
    document_type: LibraryDocument['document_type'];
    version: string;
    tags: string;
  }>({
    title: '',
    code: '',
    description: '',
    content: '',
    document_type: 'manual',
    version: '1.0',
    tags: '',
  });
  const [approvalData, setApprovalData] = useState({
    observations: '',
    corrections: '',
    reason: '',
    approvalType: 'approve' as 'approve' | 'approve_with_observations',
  });

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (filterType !== 'all') params.document_type = filterType;
    if (filterStatus !== 'all') params.status = filterStatus;

    let response;
    if (activeTab === 'pending') {
      response = await libraryDocumentApi.pendingApproval();
    } else if (activeTab === 'published') {
      response = await libraryDocumentApi.published();
    } else {
      response = await libraryDocumentApi.list(params);
    }
    
    if (response.data) {
      setDocuments((response.data as PaginatedResponse<LibraryDocument>).results || []);
    }
    setLoading(false);
  }, [searchTerm, filterType, filterStatus, activeTab]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      let response;
      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('code', formData.code);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('content', formData.content);
        formDataToSend.append('document_type', formData.document_type);
        formDataToSend.append('version', formData.version);
        formDataToSend.append('tags', formData.tags);
        formDataToSend.append('file', selectedFile);
        response = await libraryDocumentApi.createWithFile(formDataToSend);
      } else {
        response = await libraryDocumentApi.create(formData);
      }
      if (response.data) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchDocuments();
      } else if (response.error) {
        alert(`Error: ${response.error}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDocument) return;
    setIsSubmitting(true);
    try {
      let response;
      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('code', formData.code);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('content', formData.content);
        formDataToSend.append('document_type', formData.document_type);
        formDataToSend.append('version', formData.version);
        formDataToSend.append('tags', formData.tags);
        formDataToSend.append('file', selectedFile);
        response = await libraryDocumentApi.updateWithFile(selectedDocument.id, formDataToSend);
      } else {
        response = await libraryDocumentApi.update(selectedDocument.id, formData);
      }
      if (response.data) {
        setIsEditDialogOpen(false);
        resetForm();
        fetchDocuments();
      } else if (response.error) {
        alert(`Error: ${response.error}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este documento?')) {
      await libraryDocumentApi.delete(id);
      fetchDocuments();
    }
  };

  const handleSubmitForApproval = async (id: number) => {
    if (confirm('¿Está seguro de enviar este documento para aprobación?')) {
      const response = await libraryDocumentApi.submitForApproval(id);
      if (response.data) {
        fetchDocuments();
      }
    }
  };

  const handleApprove = async () => {
    if (!selectedDocument) return;
    
    let response;
    if (approvalData.approvalType === 'approve') {
      response = await libraryDocumentApi.approve(selectedDocument.id, approvalData.observations);
    } else {
      response = await libraryDocumentApi.approveWithObservations(
        selectedDocument.id,
        approvalData.observations,
        approvalData.corrections
      );
    }
    
    if (response.data) {
      setIsApproveDialogOpen(false);
      resetApprovalData();
      fetchDocuments();
    }
  };

  const handleReject = async () => {
    if (!selectedDocument) return;
    const response = await libraryDocumentApi.reject(selectedDocument.id, approvalData.reason);
    if (response.data) {
      setIsRejectDialogOpen(false);
      resetApprovalData();
      fetchDocuments();
    }
  };

  const handlePublish = async (id: number) => {
    if (confirm('¿Está seguro de publicar este documento?')) {
      const response = await libraryDocumentApi.publish(id);
      if (response.data) {
        fetchDocuments();
      }
    }
  };

  const handleArchive = async (id: number) => {
    if (confirm('¿Está seguro de archivar este documento?')) {
      const response = await libraryDocumentApi.archive(id);
      if (response.data) {
        fetchDocuments();
      }
    }
  };

  const handleDownload = async (doc: LibraryDocument) => {
    if (doc.file) {
      await libraryDocumentApi.incrementDownload(doc.id);
      // Construct full URL for download
      const fileUrl = doc.file.startsWith('http') ? doc.file : `${API_BASE_URL}${doc.file}`;
      window.open(fileUrl, '_blank');
    }
  };

  const handleView = async (doc: LibraryDocument) => {
    await libraryDocumentApi.incrementView(doc.id);
    setSelectedDocument(doc);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      description: '',
      content: '',
      document_type: 'manual',
      version: '1.0',
      tags: '',
    });
    setSelectedDocument(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetApprovalData = () => {
    setApprovalData({
      observations: '',
      corrections: '',
      reason: '',
      approvalType: 'approve',
    });
    setSelectedDocument(null);
  };

  const openEditDialog = (doc: LibraryDocument) => {
    setSelectedDocument(doc);
    setFormData({
      title: doc.title,
      code: doc.code,
      description: doc.description,
      content: doc.content,
      document_type: doc.document_type,
      version: doc.version,
      tags: doc.tags,
    });
    setIsEditDialogOpen(true);
  };

  const openApproveDialog = (doc: LibraryDocument, type: 'approve' | 'approve_with_observations') => {
    setSelectedDocument(doc);
    setApprovalData({ ...approvalData, approvalType: type });
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (doc: LibraryDocument) => {
    setSelectedDocument(doc);
    setIsRejectDialogOpen(true);
  };

  const draftCount = documents.filter(d => d.status === 'draft').length;
  const pendingCount = documents.filter(d => d.status === 'pending_approval').length;
  const publishedCount = documents.filter(d => d.status === 'published').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Library className="h-8 w-8 text-primary" />
            Biblioteca de Documentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión unificada de documentación: subir, ver, descargar, elaborar y aprobar documentos
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Documento
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
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publicados</p>
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
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendientes de Aprobación</TabsTrigger>
          <TabsTrigger value="published">Publicados</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, título, descripción o etiquetas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
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
                <Button variant="outline" onClick={fetchDocuments}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="all" className="space-y-4">
          <DocumentsTable
            documents={documents}
            loading={loading}
            onView={handleView}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onSubmitForApproval={handleSubmitForApproval}
            onApprove={(doc) => openApproveDialog(doc, 'approve')}
            onApproveWithObservations={(doc) => openApproveDialog(doc, 'approve_with_observations')}
            onReject={openRejectDialog}
            onPublish={handlePublish}
            onArchive={handleArchive}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <DocumentsTable
            documents={documents}
            loading={loading}
            onView={handleView}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onSubmitForApproval={handleSubmitForApproval}
            onApprove={(doc) => openApproveDialog(doc, 'approve')}
            onApproveWithObservations={(doc) => openApproveDialog(doc, 'approve_with_observations')}
            onReject={openRejectDialog}
            onPublish={handlePublish}
            onArchive={handleArchive}
          />
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <DocumentsTable
            documents={documents}
            loading={loading}
            onView={handleView}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onSubmitForApproval={handleSubmitForApproval}
            onApprove={(doc) => openApproveDialog(doc, 'approve')}
            onApproveWithObservations={(doc) => openApproveDialog(doc, 'approve_with_observations')}
            onReject={openRejectDialog}
            onPublish={handlePublish}
            onArchive={handleArchive}
          />
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Documento</DialogTitle>
            <DialogDescription>
              Cree un nuevo documento en la biblioteca
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
                  onValueChange={(v) => setFormData({ ...formData, document_type: v as LibraryDocument['document_type'] })}
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
                <label className="text-sm font-medium">Etiquetas</label>
                <Input
                  placeholder="sistema, manual, producción"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                placeholder="Descripción breve del documento..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido</label>
              <Textarea
                placeholder="Escriba el contenido del documento..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Archivo Adjunto</label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {selectedFile && (
                  <Button type="button" variant="ghost" size="icon" onClick={clearSelectedFile}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
                  <File className="h-4 w-4" />
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="text-muted-foreground">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, TXT, PPT, PPTX
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Documento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
                  onValueChange={(v) => setFormData({ ...formData, document_type: v as LibraryDocument['document_type'] })}
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
                <label className="text-sm font-medium">Etiquetas</label>
                <Input
                  placeholder="sistema, manual, producción"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                placeholder="Descripción breve del documento..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido</label>
              <Textarea
                placeholder="Escriba el contenido del documento..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Archivo Adjunto</label>
              {selectedDocument?.file && !selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm mb-2">
                  <File className="h-4 w-4" />
                  <span className="truncate">{selectedDocument.file_name || 'Archivo actual'}</span>
                  {selectedDocument.file_size && (
                    <span className="text-muted-foreground">
                      ({(selectedDocument.file_size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {selectedFile && (
                  <Button type="button" variant="ghost" size="icon" onClick={clearSelectedFile}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="text-muted-foreground">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <span className="text-blue-600 text-xs">(nuevo)</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, TXT, PPT, PPTX
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedDocument?.title}
            </DialogTitle>
            <DialogDescription>
              Código: {selectedDocument?.code} | Versión: {selectedDocument?.version}
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
                    <Badge variant={statusColors[selectedDocument.status]} className="gap-1">
                      {statusIcons[selectedDocument.status]}
                      {statusLabels[selectedDocument.status]}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Autor</span>
                  <p className="font-medium">{selectedDocument.author_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Departamento</span>
                  <p className="font-medium">{selectedDocument.department_name || '-'}</p>
                </div>
              </div>
              {selectedDocument.tags && (
                <div>
                  <span className="text-sm text-muted-foreground">Etiquetas</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {selectedDocument.tags.split(',').filter(tag => tag.trim()).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedDocument.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Descripción</span>
                  <p className="text-sm mt-1">{selectedDocument.description}</p>
                </div>
              )}
              {selectedDocument.content && (
                <div>
                  <span className="text-sm text-muted-foreground">Contenido</span>
                  <div className="mt-2 p-4 bg-muted rounded-lg max-h-[300px] overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{selectedDocument.content}</pre>
                  </div>
                </div>
              )}
              {selectedDocument.file && (
                <div>
                  <span className="text-sm text-muted-foreground">Archivo Adjunto</span>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-lg">
                        <File className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedDocument.file_name || 'Documento'}</p>
                        {selectedDocument.file_size && (
                          <p className="text-xs text-muted-foreground">
                            {(selectedDocument.file_size / 1024).toFixed(1)} KB
                          </p>
                        )}
                      </div>
                      <Button variant="default" size="sm" onClick={() => handleDownload(selectedDocument)}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {selectedDocument.approval_observations && (
                <div>
                  <span className="text-sm text-muted-foreground">Observaciones de Aprobación</span>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                    {selectedDocument.approval_observations}
                  </p>
                </div>
              )}
              {selectedDocument.corrections_required && (
                <div>
                  <span className="text-sm text-muted-foreground">Correcciones Requeridas</span>
                  <p className="mt-1 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                    {selectedDocument.corrections_required}
                  </p>
                </div>
              )}
              {selectedDocument.rejection_reason && (
                <div>
                  <span className="text-sm text-muted-foreground">Motivo de Rechazo</span>
                  <p className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                    {selectedDocument.rejection_reason}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground pt-4 border-t">
                <div>
                  <span>Vistas:</span>
                  <span className="ml-1 font-medium">{selectedDocument.view_count}</span>
                </div>
                <div>
                  <span>Descargas:</span>
                  <span className="ml-1 font-medium">{selectedDocument.download_count}</span>
                </div>
                <div>
                  <span>Creado:</span>
                  <span className="ml-1">
                    {new Date(selectedDocument.created_at).toLocaleDateString('es-ES')}
                  </span>
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

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {approvalData.approvalType === 'approve' ? (
                <>
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  Aprobar Documento
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5 text-yellow-600" />
                  Aprobar con Observaciones
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Observaciones</label>
              <Textarea
                placeholder="Ingrese sus observaciones..."
                value={approvalData.observations}
                onChange={(e) => setApprovalData({ ...approvalData, observations: e.target.value })}
                rows={3}
              />
            </div>
            
            {approvalData.approvalType === 'approve_with_observations' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Correcciones Requeridas *</label>
                <Textarea
                  placeholder="Describa las correcciones que debe realizar el autor..."
                  value={approvalData.corrections}
                  onChange={(e) => setApprovalData({ ...approvalData, corrections: e.target.value })}
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              {approvalData.approvalType === 'approve' ? 'Aprobar' : 'Aprobar con Observaciones'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              Rechazar Documento
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo del Rechazo *</label>
              <Textarea
                placeholder="Explique el motivo del rechazo..."
                value={approvalData.reason}
                onChange={(e) => setApprovalData({ ...approvalData, reason: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReject} variant="destructive">
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Documents Table Component
function DocumentsTable({
  documents,
  loading,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onSubmitForApproval,
  onApprove,
  onApproveWithObservations,
  onReject,
  onPublish,
  onArchive,
}: {
  documents: LibraryDocument[];
  loading: boolean;
  onView: (doc: LibraryDocument) => void;
  onEdit: (doc: LibraryDocument) => void;
  onDelete: (id: number) => void;
  onDownload: (doc: LibraryDocument) => void;
  onSubmitForApproval: (id: number) => void;
  onApprove: (doc: LibraryDocument) => void;
  onApproveWithObservations: (doc: LibraryDocument) => void;
  onReject: (doc: LibraryDocument) => void;
  onPublish: (id: number) => void;
  onArchive: (id: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos</CardTitle>
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
                <TableHead>Autor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Versión</TableHead>
                <TableHead>Archivo</TableHead>
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
                  <TableCell className="text-muted-foreground">{doc.author_name}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[doc.status]} className="gap-1">
                      {statusIcons[doc.status]}
                      {statusLabels[doc.status] || doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{doc.version}</TableCell>
                  <TableCell>
                    {doc.file ? (
                      <Badge variant="secondary" className="gap-1">
                        <File className="h-3 w-3" />
                        Sí
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => onView(doc)} title="Ver">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {doc.file && (
                        <Button variant="ghost" size="icon-sm" onClick={() => onDownload(doc)} title="Descargar">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {doc.status === 'draft' && (
                        <>
                          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(doc)} title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => onSubmitForApproval(doc.id)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Enviar para Aprobación"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => onDelete(doc.id)}
                            className="text-destructive hover:text-destructive"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {doc.status === 'pending_approval' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => onApprove(doc)}
                            className="text-green-600 hover:text-green-700"
                            title="Aprobar"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => onApproveWithObservations(doc)}
                            className="text-yellow-600 hover:text-yellow-700"
                            title="Aprobar con Observaciones"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => onReject(doc)}
                            className="text-red-600 hover:text-red-700"
                            title="Rechazar"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {(doc.status === 'approved' || doc.status === 'approved_with_observations') && (
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          onClick={() => onPublish(doc.id)}
                          className="text-green-600 hover:text-green-700"
                          title="Publicar"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {doc.status === 'published' && (
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          onClick={() => onArchive(doc.id)}
                          className="text-gray-600 hover:text-gray-700"
                          title="Archivar"
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
  );
}
