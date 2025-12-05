'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Biblioteca de Documentos</h1>
          <p className="text-muted-foreground">Accede a manuales y documentación oficial</p>
        </div>
        <Link href="/library-documents/admin">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Administrar
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card dark:bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background dark:bg-input/30 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-input bg-background dark:bg-input/30 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos</option>
              {categories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {documentTypeLabels[category] || category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron documentos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-card dark:bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground mb-1">{doc.title}</h3>
                  <p className="text-muted-foreground">
                    {documentTypeLabels[doc.document_type] || doc.document_type}
                  </p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Fecha:</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Versión:</span>
                  <span>{doc.version}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Descargas:</span>
                  <span>{doc.download_count || 0}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
                <button
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent dark:hover:bg-accent transition-colors"
                  onClick={() => handleView(doc)}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
