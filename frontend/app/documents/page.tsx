'use client';

import { useEffect, useState } from 'react';
import { documentApi, Document } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner, ErrorMessage, Badge } from '@/components';

const categoryLabels: Record<string, string> = {
  policy: 'Política',
  procedure: 'Procedimiento',
  form: 'Formulario',
  report: 'Reporte',
  other: 'Otro',
};

const categoryVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  policy: 'danger',
  procedure: 'info',
  form: 'warning',
  report: 'success',
  other: 'default',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    const result = await documentApi.list();
    
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setDocuments(result.data.results);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    
    const loadDocuments = async () => {
      if (!mounted) return;
      setLoading(true);
      setError(null);
      
      const result = await documentApi.list();
      
      if (!mounted) return;
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setDocuments(result.data.results);
      }
      
      setLoading(false);
    };

    loadDocuments();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Documentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Repositorio de documentos de la empresa
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando documentos..." />
        ) : error ? (
          <ErrorMessage
            title="Error al cargar documentos"
            message={error}
            onRetry={fetchDocuments}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {documents.map((document) => (
              <Card key={document.id} hover>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="flex-1">{document.title}</CardTitle>
                    <Badge variant={categoryVariants[document.category]}>
                      {categoryLabels[document.category]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {document.description && (
                    <p className="mb-4">{document.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {document.department_name && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">Departamento:</span>
                        <span className="font-medium">{document.department_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">Subido por:</span>
                      <span className="font-medium">{document.uploaded_by_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                      <span className="font-medium">
                        {new Date(document.uploaded_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">Tamaño:</span>
                      <span className="font-medium">{formatFileSize(document.file_size)}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <a
                      href={document.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No hay documentos disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
