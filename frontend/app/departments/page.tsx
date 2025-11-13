'use client';

import { useEffect, useState } from 'react';
import { departmentApi, Department } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner, ErrorMessage, Badge } from '@/components';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    
    const result = await departmentApi.list();
    
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setDepartments(result.data.results);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    
    const loadDepartments = async () => {
      if (!mounted) return;
      setLoading(true);
      setError(null);
      
      const result = await departmentApi.list();
      
      if (!mounted) return;
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setDepartments(result.data.results);
      }
      
      setLoading(false);
    };

    loadDepartments();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Departamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Estructura organizacional de la empresa
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando departamentos..." />
        ) : error ? (
          <ErrorMessage
            title="Error al cargar departamentos"
            message={error}
            onRetry={fetchDepartments}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <Card key={department.id} hover>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{department.name}</CardTitle>
                    <Badge variant="info">
                      {department.employee_count} empleados
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{department.description || 'Sin descripción'}</p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Creado: {new Date(department.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && departments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No hay departamentos registrados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
