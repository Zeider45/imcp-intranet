'use client';

import { useEffect, useState } from 'react';
import { announcementApi, Announcement } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner, ErrorMessage, Badge } from '@/components';

const priorityVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  low: 'default',
  normal: 'success',
  high: 'warning',
  urgent: 'danger',
};

const priorityLabels: Record<string, string> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    
    const result = await announcementApi.list();
    
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setAnnouncements(result.data.results);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    
    const loadAnnouncements = async () => {
      if (!mounted) return;
      setLoading(true);
      setError(null);
      
      const result = await announcementApi.list();
      
      if (!mounted) return;
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setAnnouncements(result.data.results);
      }
      
      setLoading(false);
    };

    loadAnnouncements();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Anuncios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comunicados y anuncios de la empresa
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando anuncios..." />
        ) : error ? (
          <ErrorMessage
            title="Error al cargar anuncios"
            message={error}
            onRetry={fetchAnnouncements}
          />
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle>{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>Por {announcement.author_name || announcement.author_username}</span>
                        <span>•</span>
                        <span>{new Date(announcement.published_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={priorityVariants[announcement.priority]}>
                        {priorityLabels[announcement.priority]}
                      </Badge>
                      {announcement.is_active && (
                        <Badge variant="success">Activo</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && announcements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No hay anuncios disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
