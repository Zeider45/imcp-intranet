'use client';

import { useEffect, useState } from 'react';
import { profileApi, UserProfile } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner, ErrorMessage, Badge } from '@/components';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    
    const result = await profileApi.list();
    
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setProfiles(result.data.results);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    
    const loadProfiles = async () => {
      if (!mounted) return;
      setLoading(true);
      setError(null);
      
      const result = await profileApi.list();
      
      if (!mounted) return;
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setProfiles(result.data.results);
      }
      
      setLoading(false);
    };

    loadProfiles();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Perfiles de Usuario
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Directorio de empleados de la empresa
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando perfiles..." />
        ) : error ? (
          <ErrorMessage
            title="Error al cargar perfiles"
            message={error}
            onRetry={fetchProfiles}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} hover>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {profile.user.full_name.charAt(0).toUpperCase() || profile.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{profile.user.full_name}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{profile.user.username}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.position && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Puesto</p>
                        <p className="font-medium">{profile.position}</p>
                      </div>
                    )}
                    
                    {profile.department_name && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Departamento</p>
                        <Badge variant="info">{profile.department_name}</Badge>
                      </div>
                    )}
                    
                    {profile.phone && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                        <p className="font-medium">{profile.phone}</p>
                      </div>
                    )}
                    
                    {profile.user.email && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-sm break-all">{profile.user.email}</p>
                      </div>
                    )}

                    {profile.bio && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Bio</p>
                        <p className="text-sm">{profile.bio}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      {profile.user.is_active ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="default">Inactivo</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && profiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No hay perfiles disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
