'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Library, 
  Search, 
  Filter,
  FileText, 
  Download,
  Eye,
  Settings,
} from 'lucide-react';
import { libraryDocumentApi } from '@/lib/api';
import type { LibraryDocument, PaginatedResponse } from '@/lib/api/types';

const documentTypeLabels: Record<string, string> = {
  manual: 'Manuales',
  procedure: 'Procedimientos',
  policy: 'Políticas',
  guide: 'Guías',
  form: 'Formularios',
  report: 'Reportes',
  other: 'Otros',
};

export default function LibraryDocumentsPage() {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'manual', 'procedure', 'policy', 'form', 'report'];

  // Fetch published documents only
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const params: { status: string; document_type?: string; search?: string } = {
      status: 'published'
    };
    
    if (selectedCategory !== 'all') params.document_type = selectedCategory;
    if (searchQuery) params.search = searchQuery;

    const response = await libraryDocumentApi.list(params);
    if (response.data) {
      const results = (response.data as PaginatedResponse<LibraryDocument>).results || [];
      setDocuments(results);
    }
    setLoading(false);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = async (doc: LibraryDocument) => {
    if (doc.file) {
      // Increment download counter
      await libraryDocumentApi.incrementDownload(doc.id);
      
      // Open file in new tab
      window.open(doc.file, '_blank');
    }
  };

  const handleView = async (doc: LibraryDocument) => {
    // Increment view counter
    await libraryDocumentApi.incrementView(doc.id);
    
    if (doc.file) {
      window.open(doc.file, '_blank');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Biblioteca de Documentos</h1>
            <p className="text-gray-600">Accede a manuales y documentación oficial</p>
          </div>
          <Link href="/library-documents/admin">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Administrar
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {documentTypeLabels[category] || category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron documentos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">{doc.title}</h3>
                    <p className="text-xs text-gray-600">
                      {documentTypeLabels[doc.document_type] || doc.document_type}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Fecha:</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Versión:</span>
                    <span>{doc.version}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Descargas:</span>
                    <span>{doc.download_count || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(doc)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
