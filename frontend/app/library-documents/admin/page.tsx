'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Library, 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Upload,
  Send,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { libraryDocumentApi } from '@/lib/api';
import type { LibraryDocument, PaginatedResponse } from '@/lib/api/types';

const documentTypeLabels: Record<string, string> = {
  manual: 'Manual',
  procedure: 'Procedimiento',
  policy: 'Política',
  guide: 'Guía',
  specification: 'Especificación',
  form: 'Formulario',
  report: 'Reporte',
  other: 'Otro',
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  pending_approval: 'Pendiente',
  approved: 'Aprobado',
  approved_with_observations: 'Aprobado con Observaciones',
  rejected: 'Rechazado',
  published: 'Publicado',
  archived: 'Archivado',
};

export default function LibraryDocumentsAdminPage() {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'draft' | 'pending_approval' | 'published'>('published');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LibraryDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    content: '',
    document_type: 'manual' as LibraryDocument['document_type'],
    version: '1.0',
    tags: '',
  });

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const params: { status?: string; document_type?: string; search?: string } = {};
    
    if (activeTab !== 'published') {
      params.status = activeTab;
    } else {
      params.status = 'published';
    }
    
    if (filterType !== 'all') params.document_type = filterType;
    if (searchTerm) params.search = searchTerm;

    const response = await libraryDocumentApi.list(params);
    if (response.data) {
      const results = (response.data as PaginatedResponse<LibraryDocument>).results || [];
      setDocuments(results);
    }
    setLoading(false);
  }, [activeTab, filterType, searchTerm]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreate = () => {
    setFormData({
      title: '',
      code: '',
      description: '',
      content: '',
      document_type: 'manual',
      version: '1.0',
      tags: '',
    });
    setSelectedFile(null);
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let response;
      if (selectedFile) {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          data.append(key, value);
        });
        data.append('file', selectedFile);
        response = await libraryDocumentApi.createWithFile(data);
      } else {
        response = await libraryDocumentApi.create(formData);
      }
      
      if (response.data) {
        setIsCreateDialogOpen(false);
        setFormData({
          title: '',
          code: '',
          description: '',
          content: '',
          document_type: 'manual',
          version: '1.0',
          tags: '',
        });
        setSelectedFile(null);
        fetchDocuments();
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

  const handleApprove = async (id: number) => {
    await libraryDocumentApi.approve(id);
    fetchDocuments();
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Motivo de rechazo:');
    if (reason) {
      await libraryDocumentApi.reject(id, reason);
      fetchDocuments();
    }
  };

  const handlePublish = async (id: number) => {
    await libraryDocumentApi.publish(id);
    fetchDocuments();
  };

  const filteredDocuments = documents;

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
        <Link href="/library-documents" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Documentos</h1>
            <p className="text-gray-600">Administración de la biblioteca de documentos</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Subir Documento
          </Button>
        </div>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="mb-6">
        <TabsList>
          <TabsTrigger value="draft">Borradores</TabsTrigger>
          <TabsTrigger value="pending_approval">Pendientes</TabsTrigger>
          <TabsTrigger value="published">Aprobados</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(documentTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron documentos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>{doc.code}</TableCell>
                    <TableCell>{documentTypeLabels[doc.document_type] || doc.document_type}</TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'published' ? 'default' : 'outline'}>
                        {statusLabels[doc.status] || doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.status === 'pending_approval' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(doc.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {doc.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePublish(doc.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)}>
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

      {/* Create/Upload Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subir Nuevo Documento</DialogTitle>
            <DialogDescription>
              Complete los detalles del documento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título del Documento</label>
              <Input
                placeholder="Ingrese el título del documento"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Código</label>
              <Input
                placeholder="Código del documento"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <Select
                value={formData.document_type}
                onValueChange={(value: any) => setFormData({ ...formData, document_type: value })}
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
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <Textarea
                rows={4}
                placeholder="Descripción del documento"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Archivo</label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Haz clic para seleccionar un archivo</p>
                  <p className="text-gray-400 text-sm">PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)</p>
                  {selectedFile && (
                    <p className="text-primary mt-2">{selectedFile.name}</p>
                  )}
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Documento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
